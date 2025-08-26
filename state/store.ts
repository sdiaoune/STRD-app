import { create } from 'zustand';
import type { 
  User,
  Organization,
  Event,
  RunPost,
  TimelineItem,
  Comment
} from '../types/models';
import { supabase } from '../supabase/client';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

interface RunState {
  isRunning: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  distanceKm: number;
  currentPace: number;
  currentSpeedKmh?: number;
  lastLocation?: { latitude: number; longitude: number; timestamp: number } | null;
  path: { latitude: number; longitude: number; timestamp: number }[];
  activityType: 'run' | 'walk';
}

interface AppState {
  // Data
  users: User[];
  organizations: Organization[];
  events: Event[];
  runPosts: RunPost[];
  timelineItems: TimelineItem[];
  
  // UI State
  currentUser: User;
  eventFilter: 'forYou' | 'all';
  runState: RunState;
  isAuthenticated: boolean;
  authError: string | null;
  
  // Actions
  likeToggle: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  startRun: () => void;
  tickRun: () => void;
  endRun: () => RunPost;
  onLocationUpdate: (lat: number, lon: number, timestampMs: number, accuracy?: number, speedMs?: number | null) => void;
  postRun: (caption: string, image?: string) => Promise<boolean>;
  deleteRunPost: (postId: string) => Promise<boolean>;
  setActivityType: (type: 'run' | 'walk') => void;
  filterEvents: (scope: 'forYou' | 'all') => void;
  joinEvent: (eventId: string) => Promise<boolean>;
  leaveEvent: (eventId: string) => Promise<boolean>;
  setReminder: (eventId: string) => Promise<boolean>;
  clearReminder: (eventId: string) => Promise<boolean>;
  signIn: (method: 'email' | 'google', email?: string, password?: string) => Promise<void>;
  signUp: (name: string, email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  _loadInitialData: () => Promise<void>;
  uploadAvatar: (uri: string) => Promise<string | null>;
  updateProfile: (fields: { name?: string | null; bio?: string | null }) => Promise<boolean>;
  searchUsers: (query: string) => Promise<User[]>;
  followUser: (userId: string) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;
  
  // Helpers
  eventById: (id: string) => Event | undefined;
  isParticipant: (eventId: string) => Promise<boolean> | boolean;
  postById: (id: string) => RunPost | undefined;
  orgById: (id: string) => Organization | undefined;
  userById: (id: string) => User | undefined;
  getFilteredEvents: () => Event[];
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  users: [],
  organizations: [],
  events: [],
  runPosts: [],
  timelineItems: [],
  currentUser: {
    id: '',
    name: null,
    handle: null,
    avatar: null,
    city: null,
    interests: [],
    followingOrgs: [],
  },

  setActivityType: (type: 'run' | 'walk') => {
    set((state) => ({ runState: { ...state.runState, activityType: type } }));
  },
  eventFilter: 'forYou',
  runState: {
    isRunning: false,
    startTime: null,
    elapsedSeconds: 0,
    distanceKm: 0,
    currentPace: 5.5,
    currentSpeedKmh: 0,
    lastLocation: null,
    path: [],
    activityType: 'run'
  },
  isAuthenticated: false,
  authError: null,
  // After auth, load initial data
  // This can be triggered by signIn/signUp
  _loadInitialData: async () => {
    const currentUserId = get().currentUser.id;
    if (!currentUserId) return;

    // profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUserId)
      .single();

    // org follow
    const { data: follows } = await supabase
      .from('user_following_organizations')
      .select('org_id')
      .eq('user_id', currentUserId);

    // orgs
    const { data: orgs } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    // events
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    // posts with aggregates
    const { data: posts } = await supabase
      .from('run_posts')
      .select('*')
      .order('created_at', { ascending: false });

    // likes by current user
    const { data: likes } = await supabase
      .from('run_post_likes')
      .select('*')
      .eq('user_id', currentUserId);

    // comments per post
    const { data: comments } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true });

    const followingOrgs = (follows || []).map(f => f.org_id);

    const users: User[] = (profile ? [{
      id: profile.id,
      name: profile.name,
      handle: profile.handle,
      avatar: profile.avatar_url,
      city: profile.city,
      interests: profile.interests ?? [],
      bio: (profile as any).bio ?? null,
      followingOrgs,
    }] : []);

    const organizations: Organization[] = (orgs || []).map(o => ({
      id: o.id,
      name: o.name,
      type: o.type,
      logo: o.logo_url,
      city: o.city,
    }));

    const eventsMapped: Event[] = (events || []).map(e => ({
      id: e.id,
      title: e.title,
      orgId: e.org_id,
      dateISO: e.date,
      city: e.city,
      location: {
        name: e.location_name,
        lat: e.location_lat,
        lon: e.location_lon,
      },
      tags: e.tags || [],
      description: e.description,
      distanceFromUserKm: e.distance_from_user_km ?? 0,
    }));

    const likesByPostId = new Set((likes || []).map(l => `${l.post_id}`));
    const commentsByPostId = new Map<string, Comment[]>();
    (comments || []).forEach(c => {
      const arr = commentsByPostId.get(c.post_id) || [];
      arr.push({ id: c.id, userId: c.user_id, text: c.text, createdAtISO: c.created_at });
      commentsByPostId.set(c.post_id, arr);
    });

    const runPosts: RunPost[] = (posts || []).map(p => ({
      id: p.id,
      userId: p.user_id,
      createdAtISO: p.created_at,
      distanceKm: p.distance_km,
      durationMin: p.duration_min,
      avgPaceMinPerKm: p.avg_pace_min_per_km,
      routePolyline: p.route_polyline,
      routePreview: p.route_preview_url,
      caption: p.caption,
      likes: p.likes_count,
      likedByCurrentUser: likesByPostId.has(p.id),
      comments: commentsByPostId.get(p.id) || [],
      isFromPartner: p.is_from_partner,
    }));

    // Timeline: latest posts + events
    const timelineItems: TimelineItem[] = [
      ...runPosts.map(p => ({ type: 'run' as const, refId: p.id, createdAtISO: p.createdAtISO })),
      ...eventsMapped.map(e => ({ type: 'event' as const, refId: e.id, createdAtISO: e.dateISO })),
    ].sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime());

    // Fetch author and commenter profiles for visible posts (other than current user)
    const authorIds = new Set<string>(runPosts.map(p => p.userId).filter(id => id && id !== currentUserId) as string[]);
    const commenterIds = new Set<string>();
    runPosts.forEach(p => {
      (commentsByPostId.get(p.id) || []).forEach(c => {
        if (c.userId && c.userId !== currentUserId) commenterIds.add(c.userId);
      });
    });
    const neededIds = Array.from(new Set<string>([...authorIds, ...commenterIds]));
    let extraUsers: User[] = [];
    if (neededIds.length > 0) {
      const { data: profilesNeeded } = await supabase
        .from('profiles')
        .select('id, name, handle, avatar_url, city, interests, bio')
        .in('id', neededIds as any);
      extraUsers = (profilesNeeded || []).map(p => ({
        id: p.id,
        name: p.name,
        handle: p.handle,
        avatar: p.avatar_url,
        city: p.city,
        interests: p.interests ?? [],
        followingOrgs: [],
        bio: (p as any).bio ?? null,
      }));
    }

    set({
      users: [...users, ...extraUsers],
      organizations,
      events: eventsMapped,
      runPosts,
      timelineItems,
      currentUser: users[0] || get().currentUser,
    });
  },

  // Actions
  likeToggle: async (postId: string) => {
    const state = get();
    const userId = state.currentUser.id;
    const target = state.runPosts.find(p => p.id === postId);
    if (!target) return;
    const willLike = !target.likedByCurrentUser;

    // optimistic update
    set(({ runPosts }) => ({
      runPosts: runPosts.map(p => p.id === postId ? {
        ...p,
        likedByCurrentUser: willLike,
        likes: p.likes + (willLike ? 1 : -1),
      } : p)
    }));

    if (willLike) {
      await supabase.from('run_post_likes').insert({ post_id: postId, user_id: userId });
      await supabase.rpc('increment_likes_count', { post_id_input: postId }).catch(async () => {
        await supabase.from('run_posts').update({ likes_count: (target.likes || 0) + 1 }).eq('id', postId);
      });
    } else {
      await supabase.from('run_post_likes').delete().eq('post_id', postId).eq('user_id', userId);
      await supabase.rpc('decrement_likes_count', { post_id_input: postId }).catch(async () => {
        await supabase.from('run_posts').update({ likes_count: (target.likes || 0) - 1 }).eq('id', postId);
      });
    }
  },

  addComment: async (postId: string, text: string) => {
    const currentUserId = get().currentUser.id;
    const createdAtISO = new Date().toISOString();
    const optimistic: Comment = { id: `temp_${Date.now()}`, userId: currentUserId, text, createdAtISO };
    set((state) => ({
      runPosts: state.runPosts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, optimistic] }
          : post
      )
    }));
    const { data, error } = await supabase.from('comments').insert({ post_id: postId, user_id: currentUserId, text }).select('*').single();
    if (!error && data) {
      set((state) => ({
        runPosts: state.runPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                comments: post.comments.map(c => c.id === optimistic.id ? { id: data.id, userId: data.user_id, text: data.text, createdAtISO: data.created_at } : c)
              }
            : post
        )
      }));
    }
  },

  startRun: () => {
    set((state) => ({
      runState: {
        ...state.runState,
        isRunning: true,
        startTime: Date.now(),
        elapsedSeconds: 0,
        distanceKm: 0,
        currentPace: 5.5,
        lastLocation: null,
        path: []
      }
    }));
  },

  tickRun: () => {
    const state = get();
    if (!state.runState.isRunning || !state.runState.startTime) return;

    const now = Date.now();
    const elapsedMs = now - state.runState.startTime;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const newDistance = state.runState.distanceKm; // distance now advanced via GPS
    const speed = state.runState.currentSpeedKmh || 0;
    const pace = speed > 0.1 ? 60 / speed : Infinity; // Infinity to render as — /km

    set((state) => ({
      runState: {
        ...state.runState,
        elapsedSeconds,
        distanceKm: newDistance,
        currentPace: pace
      }
    }));
  },

  onLocationUpdate: (lat: number, lon: number, timestampMs: number, accuracy?: number, speedMs?: number | null) => {
    const state = get();
    if (!state.runState.isRunning) return;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const last = state.runState.lastLocation;
    let distanceKm = state.runState.distanceKm;
    let speedKmh = state.runState.currentSpeedKmh || 0;

    // Ignore very inaccurate points (relax to work indoors too)
    const isAccurate = accuracy == null || accuracy <= 100; // meters

    if (last && isAccurate) {
      const R = 6371; // km
      const dLat = toRad(lat - last.latitude);
      const dLon = toRad(lon - last.longitude);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(last.latitude)) * Math.cos(toRad(lat)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const deltaKm = R * c;
      const deltaTimeH = Math.max((timestampMs - last.timestamp) / 3600000, 1e-6);
      const instKmh = speedMs != null && isFinite(speedMs) ? Math.max(speedMs, 0) * 3.6 : (deltaKm / deltaTimeH);
      // Filter tiny jitter (1 m)
      const minStepKm = 0.001; // 1 meter
      if (deltaKm > minStepKm) {
        distanceKm += deltaKm;
        speedKmh = instKmh;
      }
    }

    set((state) => ({
      runState: {
        ...state.runState,
        distanceKm,
        currentSpeedKmh: speedKmh,
        lastLocation: { latitude: lat, longitude: lon, timestamp: timestampMs },
        path: [...state.runState.path, { latitude: lat, longitude: lon, timestamp: timestampMs }],
      },
    }));
  },

  endRun: () => {
    const state = get();
    const { distanceKm, elapsedSeconds, currentPace } = state.runState;
    
    set((state) => ({
      runState: {
        ...state.runState,
        isRunning: false,
        startTime: null
      }
    }));

    return {
      id: `run_${Date.now()}`,
      userId: state.currentUser.id,
      createdAtISO: new Date().toISOString(),
      distanceKm: Math.round(distanceKm * 100) / 100,
      durationMin: Math.round(elapsedSeconds / 60),
      avgPaceMinPerKm: Math.round(currentPace * 10) / 10,
      likes: 0,
      likedByCurrentUser: false,
      comments: []
    };
  },

  postRun: async (caption: string, image?: string) => {
    const userId = get().currentUser.id;
    if (!userId) return false;
    const { encodePolyline } = await import('../utils/geo');
    const path = get().runState.path.map(p => ({ latitude: p.latitude, longitude: p.longitude }));
    const routePolyline = path.length >= 2 ? encodePolyline(path) : null;
    // Compute average pace from distance and duration to avoid Infinity/NaN
    const distanceKm = Math.round(get().runState.distanceKm * 100) / 100;
    const elapsedSeconds = get().runState.elapsedSeconds;
    const durationMin = elapsedSeconds > 0 ? Math.max(1, Math.round(elapsedSeconds / 60)) : 0;
    // Compute average pace using precise seconds: (minutes) / km
    const paceMinPerKmRaw = distanceKm > 0 ? ((elapsedSeconds / 60) / distanceKm) : 0;
    const avgPaceMinPerKm = isFinite(paceMinPerKmRaw) && !isNaN(paceMinPerKmRaw) ? Math.round(paceMinPerKmRaw * 10) / 10 : 0;
    const newRun = {
      user_id: userId,
      distance_km: distanceKm,
      duration_min: durationMin,
      avg_pace_min_per_km: avgPaceMinPerKm,
      activity_type: get().runState.activityType,
      route_polyline: routePolyline,
      route_preview_url: image || null,
      caption: caption || null,
      is_from_partner: false,
      likes_count: 0,
    };
    try {
      const { data, error } = await supabase.from('run_posts').insert(newRun).select('*').single();
      if (error || !data) return false;
      const post: RunPost = {
        id: data.id,
        userId: data.user_id,
        createdAtISO: data.created_at,
        distanceKm: data.distance_km,
        durationMin: data.duration_min,
        avgPaceMinPerKm: data.avg_pace_min_per_km,
        activityType: data.activity_type,
        routePolyline: data.route_polyline ?? null,
        routePreview: data.route_preview_url,
        caption: data.caption,
        likes: data.likes_count,
        likedByCurrentUser: false,
        comments: [],
      };
      set((state) => ({
        runPosts: [post, ...state.runPosts],
        timelineItems: [
          { type: 'run', refId: post.id, createdAtISO: post.createdAtISO },
          ...state.timelineItems
        ]
      }));
      return true;
    } catch {
      return false;
    }
  },

  deleteRunPost: async (postId: string) => {
    const userId = get().currentUser.id;
    if (!userId) return false;
    const { data: post } = await supabase.from('run_posts').select('user_id').eq('id', postId).maybeSingle();
    if (!post || post.user_id !== userId) return false;
    const { error } = await supabase.from('run_posts').delete().eq('id', postId);
    if (error) return false;
    set((state) => ({
      runPosts: state.runPosts.filter(p => p.id !== postId),
      timelineItems: state.timelineItems.filter(t => !(t.type === 'run' && t.refId === postId)),
    }));
    return true;
  },

  filterEvents: (scope: 'forYou' | 'all') => {
    set({ eventFilter: scope });
  },

  joinEvent: async (eventId: string) => {
    const userId = get().currentUser.id;
    if (!userId) return false;
    const { error } = await supabase.from('event_participants').insert({ event_id: eventId, user_id: userId });
    return !error;
  },
  leaveEvent: async (eventId: string) => {
    const userId = get().currentUser.id;
    if (!userId) return false;
    const { error } = await supabase.from('event_participants').delete().eq('event_id', eventId).eq('user_id', userId);
    return !error;
  },
  setReminder: async (eventId: string) => {
    const userId = get().currentUser.id;
    if (!userId) return false;
    const { error } = await supabase.from('event_reminders').insert({ event_id: eventId, user_id: userId });
    return !error;
  },
  clearReminder: async (eventId: string) => {
    const userId = get().currentUser.id;
    if (!userId) return false;
    const { error } = await supabase.from('event_reminders').delete().eq('event_id', eventId).eq('user_id', userId);
    return !error;
  },

  signIn: async (method: 'email' | 'google', email?: string, password?: string) => {
    set({ authError: null });
    try {
      if (method === 'email') {
        if (!email || !password) throw new Error('Missing credentials');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        set({ isAuthenticated: true });
        const userId = data.user?.id || '';
        set((state) => ({ currentUser: { ...state.currentUser, id: userId } }));
        // Ensure profile row exists to satisfy FKs and RLS
        if (userId) {
          const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
          if (!existing) {
            await supabase.from('profiles').insert({ id: userId, name: null });
          }
        }
        await get()._loadInitialData();
      } else if (method === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) throw error;
      }
    } catch (e: any) {
      set({ authError: e?.message || 'Sign-in failed' });
    }
  },

  signUp: async (name: string, email: string, password?: string) => {
    set({ authError: null });
    try {
      if (!email || !password) throw new Error('Missing credentials');
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      const userId = data.user?.id || '';
      if (userId) {
        await supabase.from('profiles').insert({ id: userId, name });
      }
      set({ isAuthenticated: true });
      set((state) => ({ currentUser: { ...state.currentUser, id: userId, name } }));
      await get()._loadInitialData();
    } catch (e: any) {
      set({ authError: e?.message || 'Sign-up failed' });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, users: [], organizations: [], events: [], runPosts: [], timelineItems: [] });
  },

  initializeAuth: async () => {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    if (userId) {
      set((state) => ({ isAuthenticated: true, currentUser: { ...state.currentUser, id: userId } }));
      // Ensure profile exists
      const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
      if (!existing) {
        await supabase.from('profiles').insert({ id: userId, name: null });
      }
      await get()._loadInitialData();
    }
    supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id;
      if (uid) {
        set((state) => ({ isAuthenticated: true, currentUser: { ...state.currentUser, id: uid } }));
        const { data: existing } = await supabase.from('profiles').select('id').eq('id', uid).maybeSingle();
        if (!existing) {
          await supabase.from('profiles').insert({ id: uid, name: null });
        }
        await get()._loadInitialData();
      } else {
        set({ isAuthenticated: false, users: [], organizations: [], events: [], runPosts: [], timelineItems: [] });
      }
    });
  },

  uploadAvatar: async (uri: string) => {
    const userId = get().currentUser.id;
    if (!userId) return null;
    const fileExt = (uri.split('.').pop() || 'jpg').toLowerCase();
    const path = `${userId}/${Date.now()}.${fileExt}`;
    const mime = fileExt === 'png' ? 'image/png' : 'image/jpeg';
    // Direct binary upload to Storage via FileSystem to avoid zero-byte blobs on iOS
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const baseUrl = (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_SUPABASE_URL as string;
    if (!token || !baseUrl) return null;
    const uploadUrl = `${baseUrl}/storage/v1/object/avatars/${encodeURIComponent(path)}`;
    const result = await FileSystem.uploadAsync(uploadUrl, uri, {
      httpMethod: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': mime,
        'x-upsert': 'false',
      },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });
    if (result.status !== 200) return null;
    const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = publicUrl.publicUrl;
    const displayUrl = `${url}?t=${Date.now()}`;
    // Update profile
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId);
    // Update local state
    set((state) => ({
      currentUser: { ...state.currentUser, avatar: displayUrl },
      users: state.users.map(u => u.id === userId ? { ...u, avatar: displayUrl } : u),
    }));
    return displayUrl;
  },

  updateProfile: async (fields: { name?: string | null; bio?: string | null }) => {
    const userId = get().currentUser.id;
    if (!userId) return false;
    const updates: any = {};
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.bio !== undefined) updates.bio = fields.bio;
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) return false;
    set((state) => ({
      currentUser: { ...state.currentUser, ...('name' in updates ? { name: updates.name } : {}), ...('bio' in updates ? { bio: updates.bio } : {}) },
      users: state.users.map(u => u.id === userId ? { ...u, ...('name' in updates ? { name: updates.name } : {}), ...('bio' in updates ? { bio: updates.bio } : {}) } : u),
    }));
    return true;
  },

  searchUsers: async (query: string) => {
    const uid = get().currentUser.id;
    const { data } = await supabase
      .from('profiles')
      .select('id, name, handle, avatar_url, city, interests')
      .ilike('name', `%${query}%`);
    // fetch following map
    const { data: following } = await supabase
      .from('user_follows')
      .select('followee_id')
      .eq('follower_id', uid);
    const followingSet = new Set((following || []).map(f => f.followee_id));
    return (data || []).map(p => ({ id: p.id, name: p.name, handle: p.handle, avatar: p.avatar_url, city: p.city, interests: p.interests ?? [], followingOrgs: [], __following: followingSet.has(p.id) } as any));
  },
  followUser: async (userIdToFollow: string) => {
    const userId = get().currentUser.id;
    if (!userId || userIdToFollow === userId) return false;
    const { error } = await supabase.from('user_follows').insert({ follower_id: userId, followee_id: userIdToFollow });
    return !error;
  },
  unfollowUser: async (userIdToUnfollow: string) => {
    const userId = get().currentUser.id;
    if (!userId || userIdToUnfollow === userId) return false;
    const { error } = await supabase.from('user_follows').delete().eq('follower_id', userId).eq('followee_id', userIdToUnfollow);
    return !error;
  },

  // Helper functions
  eventById: (id: string) => {
    return get().events.find(event => event.id === id);
  },

  postById: (id: string) => {
    return get().runPosts.find(post => post.id === id);
  },

  orgById: (id: string) => {
    return get().organizations.find(org => org.id === id);
  },

  userById: (id: string) => {
    return get().users.find(user => user.id === id);
  },

  getFilteredEvents: () => {
    const state = get();
    if (state.eventFilter === 'all') {
      return state.events;
    }

    // For You logic: item's orgId ∈ currentUser.followingOrgs OR tag intersects currentUser.interests
    return state.events.filter(event => {
      const org = state.orgById(event.orgId);
      const isFollowingOrg = state.currentUser.followingOrgs.includes(event.orgId);
      const hasMatchingTags = event.tags.some(tag => 
        state.currentUser.interests.includes(tag)
      );
      
      return isFollowingOrg || hasMatchingTags;
    });
  },

  isParticipant: (_eventId: string) => true,
}));
