import { create } from 'zustand';
import type { 
  User,
  Organization,
  Event,
  RunPost,
  TimelineItem,
  Comment,
  PagePost,
  RunVisibility,
} from '../types/models';
import { supabase } from '../supabase/client';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { compressAvatarImage } from '../utils/image';

// Storage keys for caching liked posts
const LIKED_POSTS_CACHE_KEY = 'strd:liked_posts';
const LIKED_POSTS_CACHE_TIMESTAMP_KEY = 'strd:liked_posts_timestamp';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

// Helper functions for caching liked posts
const getLikedPostsCacheKey = (userId: string) => `${LIKED_POSTS_CACHE_KEY}:${userId}`;
const getLikedPostsTimestampKey = (userId: string) => `${LIKED_POSTS_CACHE_TIMESTAMP_KEY}:${userId}`;

const loadCachedLikedPosts = async (userId: string): Promise<Set<string> | null> => {
  try {
    const cacheKey = getLikedPostsCacheKey(userId);
    const timestampKey = getLikedPostsTimestampKey(userId);
    
    const [cachedData, timestamp] = await Promise.all([
      AsyncStorage.getItem(cacheKey),
      AsyncStorage.getItem(timestampKey)
    ]);
    
    if (!cachedData || !timestamp) {
      return null;
    }
    
    const cacheAge = Date.now() - parseInt(timestamp, 10);
    if (cacheAge > CACHE_TTL_MS) {
      // Cache expired, remove it
      await Promise.all([
        AsyncStorage.removeItem(cacheKey),
        AsyncStorage.removeItem(timestampKey)
      ]);
      return null;
    }
    
    const likedPostIds = JSON.parse(cachedData) as string[];
    return new Set(likedPostIds);
  } catch (error) {
    console.error('[loadCachedLikedPosts] Error loading cache:', error);
    return null;
  }
};

const saveLikedPostsCache = async (userId: string, likedPostIds: string[]): Promise<void> => {
  try {
    const cacheKey = getLikedPostsCacheKey(userId);
    const timestampKey = getLikedPostsTimestampKey(userId);
    
    await Promise.all([
      AsyncStorage.setItem(cacheKey, JSON.stringify(likedPostIds)),
      AsyncStorage.setItem(timestampKey, Date.now().toString())
    ]);
  } catch (error) {
    console.error('[saveLikedPostsCache] Error saving cache:', error);
  }
};

const updateLikedPostsCache = async (userId: string, postId: string, isLiked: boolean): Promise<void> => {
  try {
    const cached = await loadCachedLikedPosts(userId);
    if (!cached) return; // No cache to update
    
    if (isLiked) {
      cached.add(postId);
    } else {
      cached.delete(postId);
    }
    
    await saveLikedPostsCache(userId, Array.from(cached));
  } catch (error) {
    console.error('[updateLikedPostsCache] Error updating cache:', error);
  }
};

interface RunState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  accumulatedSeconds: number;
  elapsedSeconds: number;
  distanceKm: number;
  currentPace: number;
  currentSpeedKmh?: number;
  lastLocation?: { latitude: number; longitude: number; timestamp: number } | null;
  path: { latitude: number; longitude: number; timestamp: number }[];
  activityType: 'run' | 'walk';
  visibility: RunVisibility;
}

const UNIT_PREFERENCE_KEY = 'strd_unit_preference';
const THEME_PREFERENCE_KEY = 'strd_theme_preference';
const ACCENT_PREFERENCE_KEY = 'strd_accent_preference';
// Reuse avatars bucket for run media to avoid relying on missing storage buckets in staging
const RUN_MEDIA_BUCKET = 'avatars';

const uploadImageToStorage = async (bucket: string, path: string, uri: string, mimeTypeOverride?: string) => {
  try {
    console.log(`[uploadImageToStorage] Starting upload to bucket: ${bucket}, path: ${path}`);
    
    // For React Native, we need to use a different approach
    // Convert the URI to a FormData object
    const formData = new FormData();
    
    // Determine the file type from the URI unless explicitly provided
    const inferredFileType = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const inferredMimeType = inferredFileType === 'png' ? 'image/png' : 'image/jpeg';
    const mimeType = mimeTypeOverride || inferredMimeType;
    
    // Create a file object for React Native
    formData.append('file', {
      uri: uri,
      type: mimeType,
      name: path.split('/').pop() || `image.${inferredFileType}`,
    } as any);
    
    // Use Supabase client's upload method with FormData
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, formData, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType
      });
    
    if (error) {
      console.error('[uploadImageToStorage] Supabase upload error:', error);
      return null;
    }
    
    if (!data?.path) {
      console.error('[uploadImageToStorage] No path returned from upload');
      return null;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    if (!publicUrlData?.publicUrl) {
      console.error('[uploadImageToStorage] Failed to get public URL');
      return null;
    }
    
    console.log('[uploadImageToStorage] Upload successful:', publicUrlData.publicUrl);
    return `${publicUrlData.publicUrl}?t=${Date.now()}`;
  } catch (error) {
    console.error('[uploadImageToStorage] Unexpected error:', error);
    return null;
  }
};

type AccentName = 'blue' | 'teal' | 'violet' | 'pink' | 'orange' | 'green';
type AccentPreference = AccentName | string; // hex like #RRGGBB is allowed

interface AppState {
  // Data
  users: User[];
  organizations: Organization[];
  events: Event[];
  runPosts: RunPost[];
  pagePosts: PagePost[];
  timelineItems: TimelineItem[];

  // UI State
  currentUser: User;
  followingUserIds: string[];
  eventFilter: 'forYou' | 'all';
  distanceRadiusMi: number;
  runState: RunState;
  isAuthenticated: boolean;
  authError: string | null;
  // Preferences
  unitPreference: 'metric' | 'imperial';
  themePreference: 'dark' | 'light';
  accentPreference: AccentPreference;
  hasHydratedTheme: boolean;
  defaultRunVisibility: RunVisibility;
  
  // Session tracking (avoid race conditions)
  _currentSessionId: string | null;
  _isLoadingData: boolean;
  
  // Actions
  _syncPostLikeState: (postId: string) => Promise<boolean>;
  likeToggle: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  startRun: () => void;
  tickRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  endRun: () => RunPost;
  onLocationUpdate: (lat: number, lon: number, timestampMs: number, accuracy?: number, speedMs?: number | null) => void;
  postRun: (caption: string, image?: string) => Promise<boolean>;
  deleteRunPost: (postId: string) => Promise<boolean>;
  setActivityType: (type: 'run' | 'walk') => void;
  setRunVisibility: (visibility: RunVisibility) => void;
  setDefaultRunVisibility: (visibility: RunVisibility) => Promise<boolean>;
  filterEvents: (scope: 'forYou' | 'all') => void;
  joinEvent: (eventId: string) => Promise<boolean>;
  leaveEvent: (eventId: string) => Promise<boolean>;
  setReminder: (eventId: string) => Promise<boolean>;
  clearReminder: (eventId: string) => Promise<boolean>;
  setUnitPreference: (unit: 'metric' | 'imperial') => void;
  setThemePreference: (theme: 'dark' | 'light') => void;
  setAccentPreference: (accent: AccentPreference) => void;
  setDistanceRadiusMi: (mi: number) => void;
  signIn: (method: 'email' | 'google', email?: string, password?: string) => Promise<void>;
  signUp: (name: string, email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  hydratePreferences: () => Promise<void>;
  _loadInitialData: (explicitUserId?: string) => Promise<void>;
  uploadAvatar: (uri: string) => Promise<string | null>;
  updateProfile: (fields: { name?: string | null; bio?: string | null }) => Promise<boolean>;
  searchUsers: (query: string) => Promise<User[]>;
  searchOrganizations: (query: string) => Promise<Organization[]>;
  followUser: (userId: string) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;
  followPage: (orgId: string) => Promise<boolean>;
  unfollowPage: (orgId: string) => Promise<boolean>;
  createPage: (args: { name: string; type: Organization['type']; city: string; logoUri?: string; website?: string | null }) => Promise<string>;
  updatePage: (orgId: string, args: { name?: string; city?: string; logoUri?: string; website?: string | null }) => Promise<boolean>;
  deletePage: (orgId: string) => Promise<boolean>;
  createEvent: (orgId: string, dto: { title: string; dateISO: string; city: string; location: { name: string; lat: number; lon: number }; tags: string[]; description?: string | null }, coverUri?: string) => Promise<boolean>;
  updateEvent: (eventId: string, updates: Partial<{ title: string; dateISO: string; city: string; location: { name: string; lat: number; lon: number }; tags: string[]; description: string | null }>, coverUri?: string) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  
  // Helpers
  eventById: (id: string) => Event | undefined;
  isParticipant: (eventId: string) => Promise<boolean> | boolean;
  postById: (id: string) => RunPost | undefined;
  orgById: (id: string) => Organization | undefined;
  userById: (id: string) => User | undefined;
  getFilteredEvents: (scope?: 'forYou' | 'all') => Event[];
  getTimelineItems: (scope: 'all' | 'forYou') => TimelineItem[];
  ownedOrganizations: () => Organization[];
  manageableEvents: () => Event[];
}

export const useStore = create<AppState>((set, get) => ({
  // Utility: guard long-running requests so UI never hangs forever
  // Returns null on timeout and logs the label for debugging
  withTimeout: undefined as any,
  // Initial state
  users: [],
  organizations: [],
  events: [],
  runPosts: [],
  pagePosts: [],
  timelineItems: [],
  currentUser: {
    id: '',
    name: null,
    handle: null,
    avatar: null,
    city: null,
    interests: [],
    followingOrgs: [],
    isSuperAdmin: false,
  },
  followingUserIds: [],
  unitPreference: 'metric',
  themePreference: 'dark',
  accentPreference: 'blue',
  hasHydratedTheme: false,
  defaultRunVisibility: 'followers',
  distanceRadiusMi: 10,
  
  // Session tracking to prevent race conditions
  _currentSessionId: null,
  _isLoadingData: false,

  setActivityType: (type: 'run' | 'walk') => {
    set((state) => ({ runState: { ...state.runState, activityType: type } }));
  },
  setRunVisibility: (visibility: RunVisibility) => {
    set((state) => ({
      runState: {
        ...state.runState,
        visibility,
      },
    }));
  },
  setDefaultRunVisibility: async (visibility: RunVisibility) => {
    const userId = get().currentUser.id;
    if (!userId) {
      console.warn('[setDefaultRunVisibility] Missing user ID');
      return false;
    }
    const { error } = await supabase
      .from('user_preferences')
      .upsert(
        { user_id: userId, default_run_visibility: visibility },
        { onConflict: 'user_id' }
      );
    if (error) {
      console.error('[setDefaultRunVisibility] Failed to persist preference:', error);
      return false;
    }
    set((state) => ({
      defaultRunVisibility: visibility,
      runState: {
        ...state.runState,
        visibility,
      },
    }));
    return true;
  },
  setUnitPreference: (unit: 'metric' | 'imperial') => {
    set({ unitPreference: unit });
    AsyncStorage.setItem(UNIT_PREFERENCE_KEY, unit).catch(() => {});
  },
  setThemePreference: (theme: 'dark' | 'light') => {
    set({ themePreference: theme, hasHydratedTheme: true });
    AsyncStorage.setItem(THEME_PREFERENCE_KEY, theme).catch(() => {});
  },
  setAccentPreference: (accent: AccentPreference) => {
    set({ accentPreference: accent });
    AsyncStorage.setItem(ACCENT_PREFERENCE_KEY, accent).catch(() => {});
  },
  setDistanceRadiusMi: (mi: number) => {
    const clamped = Math.min(30, Math.max(10, Math.round(mi)));
    set({ distanceRadiusMi: clamped });
  },
  eventFilter: 'all',
  runState: {
    isRunning: false,
    isPaused: false,
    startTime: null,
    accumulatedSeconds: 0,
    elapsedSeconds: 0,
    distanceKm: 0,
    currentPace: 5.5,
    currentSpeedKmh: 0,
    lastLocation: null,
    path: [],
    activityType: 'run',
    visibility: 'followers',
  },
  isAuthenticated: false,
  authError: null,
  // After auth, load initial data
  // This can be triggered by signIn/signUp
  _loadInitialData: async (explicitUserId?: string) => {
    try {
      const currentUserId = explicitUserId || get().currentUser.id;
      if (!currentUserId) {
        console.log('[_loadInitialData] No user ID, skipping data load');
        return;
      }
      const snapshotRunState = get().runState;
      const fallbackRunVisibility = get().defaultRunVisibility || 'followers';
      console.log('[_loadInitialData] Loading data for user:', currentUserId);

    // profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .maybeSingle();
      console.log('[_loadInitialData] Profile query result:', {
        hasProfile: !!profile,
        profileError,
      });

    // user preferences
      const { data: preferences, error: prefsError } = await supabase
        .from('user_preferences')
        .select('default_run_visibility')
        .eq('user_id', currentUserId)
        .maybeSingle();
      if (prefsError) {
        console.error('[_loadInitialData] Preferences query error:', prefsError);
      }
      const resolvedRunVisibility: RunVisibility =
        (preferences?.default_run_visibility as RunVisibility | undefined) ??
        snapshotRunState.visibility ??
        fallbackRunVisibility ??
        'followers';

    // org follow
      const { data: follows, error: followsError } = await supabase
        .from('user_following_organizations')
        .select('org_id')
        .eq('user_id', currentUserId);
      if (followsError) {
        console.error('[_loadInitialData] Follows query error:', followsError);
      }

    // orgs
  const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
      if (orgsError) {
        console.error('[_loadInitialData] Organizations query error:', orgsError);
      }

    // events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      console.log('[_loadInitialData] Events query:', {
        count: events?.length ?? 0,
        eventsError,
      });

      const { data: userFollowRows, error: userFollowsError } = await supabase
        .from('user_follows')
        .select('followee_id')
        .eq('follower_id', currentUserId);
      if (userFollowsError) {
        console.error('[_loadInitialData] User follows query error:', userFollowsError);
      }

    // posts with aggregates
      const { data: posts, error: postsError } = await supabase
        .from('run_posts')
        .select('*')
        .order('created_at', { ascending: false });
    // organization (page) posts
      const { data: orgPosts, error: orgPostsError } = await supabase
        .from('organization_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (orgPostsError) {
        console.error('[_loadInitialData] Organization posts query error:', orgPostsError);
      }
      console.log('[_loadInitialData] Posts query:', {
        count: posts?.length ?? 0,
        postsError,
      });

    // owner-only route data
      const { data: runRoutes, error: runRoutesError } = await supabase
        .from('run_routes')
        .select('run_id, route_polyline')
        .eq('user_id', currentUserId);
      if (runRoutesError) {
        console.error('[_loadInitialData] Run routes query error:', runRoutesError);
      }
      console.log('[_loadInitialData] Run routes query:', {
        count: runRoutes?.length ?? 0,
        runRoutesError,
      });

    // Fetch fresh likes from database
    console.log('[_loadInitialData] Fetching likes for user:', {
      userId: currentUserId,
      userIdType: typeof currentUserId,
      userIdLength: currentUserId?.length
    });
    
    const { data: likes, error: likesError } = await supabase
      .from('run_post_likes')
      .select('*')
      .eq('user_id', currentUserId);
    if (likesError) {
      console.error('[_loadInitialData] Likes query error:', likesError);
    }
    
    console.log('[_loadInitialData] Likes fetched from DB:', {
      count: likes?.length ?? 0,
      likesData: likes,
      likes: likes?.map(l => ({ post_id: l.post_id, user_id: l.user_id, post_id_type: typeof l.post_id }))
    });
    
    const likedPostIds = (likes || []).map(l => String(l.post_id).trim());
    const likesByPostId = new Set(likedPostIds);
    
    console.log('[_loadInitialData] Built likesByPostId Set:', {
      setSize: likesByPostId.size,
      setContents: Array.from(likesByPostId)
    });
    
    // Update cache with fresh data for next load
    await saveLikedPostsCache(currentUserId, likedPostIds);
    console.log('[_loadInitialData] Likes cached for future use:', {
      count: likedPostIds.length
    });

    // comments per post
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true });
    if (commentsError) {
      console.error('[_loadInitialData] Comments query error:', commentsError);
    }

    const followingOrgs = (follows || []).map(f => f.org_id);

    const isSuperAdmin = !!(profile && ((profile as any).role === 'super_admin' || (profile as any).is_super_admin));

    const users: User[] = (profile ? [{
      id: profile.id,
      name: profile.name,
      handle: profile.handle,
      avatar: profile.avatar_url,
      city: profile.city,
      interests: profile.interests ?? [],
      bio: (profile as any).bio ?? null,
      followingOrgs,
      isSuperAdmin,
      isCertified: (profile as any).is_certified ?? false,
      sponsoredUntil: (profile as any).sponsored_until ?? null,
    }] : []);

    const organizations: Organization[] = (orgs || []).map(o => ({
      id: o.id,
      name: o.name,
      type: o.type,
      logo: o.logo_url,
      city: o.city,
      website: (o as any).website_url ?? null,
      ownerId: (o as any).owner_id ?? undefined,
      isCertified: (o as any).is_certified ?? false,
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
      distanceFromUserKm: e.distance_from_user_km ?? null,
      coverImage: e.cover_image_url ?? e.cover_image ?? null,
      createdByUserId: (e as any).created_by ?? undefined,
      sponsoredFrom: (e as any).sponsored_from ?? null,
      sponsoredUntil: (e as any).sponsored_until ?? null,
    }));

    const followingUsers = (userFollowRows || []).map((row: any) => row.followee_id as string);

    const eventsWithinRadius = eventsMapped; // filter by radius later so user can adjust

    // Convert post IDs to strings for consistent comparison (Supabase returns UUIDs as strings)
    // Use trim() for safety in case of any whitespace issues
    const normalizeId = (id: any): string => String(id).trim();

    const routesByRunId = new Map<string, string | null>();
    (runRoutes || []).forEach((rr: any) => {
      const key = normalizeId(rr.run_id);
      routesByRunId.set(key, rr.route_polyline ?? null);
    });

    // likesByPostId is already set above (from cache or DB)
    console.log('[_loadInitialData] Likes Set:', {
      size: likesByPostId.size,
      sampleLikes: Array.from(likesByPostId).slice(0, 3)
    });
    
    const commentsByPostId = new Map<string, Comment[]>();
    (comments || []).forEach(c => {
      const arr = commentsByPostId.get(c.post_id) || [];
      arr.push({ id: c.id, userId: c.user_id, text: c.text, createdAtISO: c.created_at });
      commentsByPostId.set(c.post_id, arr);
    });

    const runPosts: RunPost[] = (posts || []).map(p => {
      const postIdStr = normalizeId(p.id);
      const isLiked = likesByPostId.has(postIdStr);
      const ownerRoute = routesByRunId.get(postIdStr);
      if (isLiked) {
        console.log('[_loadInitialData] Post is liked:', { 
          postId: p.id, 
          postIdStr,
          postIdType: typeof p.id,
          inSet: likesByPostId.has(postIdStr)
        });
      }
      return {
        id: p.id,
        userId: p.user_id,
        createdAtISO: p.created_at,
        distanceKm: p.distance_km,
        durationMin: p.duration_min,
        avgPaceMinPerKm: p.avg_pace_min_per_km,
      visibility: (p.visibility as RunVisibility) ?? 'followers',
        routePolyline: ownerRoute ?? null,
        routePreview: p.route_preview_url ?? null,
        caption: p.caption,
        likes: p.likes_count,
        likedByCurrentUser: isLiked,
        comments: commentsByPostId.get(p.id) || [],
        isFromPartner: p.is_from_partner,
        sponsoredFrom: (p as any).sponsored_from ?? null,
        sponsoredUntil: (p as any).sponsored_until ?? null,
      };
    });

    const pagePosts: PagePost[] = (orgPosts || []).map(op => ({
      id: op.id,
      orgId: op.org_id,
      createdAtISO: op.created_at,
      content: op.content,
      imageUrl: op.image_url ?? null,
      sponsoredFrom: (op as any).sponsored_from ?? null,
      sponsoredUntil: (op as any).sponsored_until ?? null,
    }));

    // Timeline: latest posts + events
    const timelineItems: TimelineItem[] = [
      ...runPosts.map(p => ({ type: 'run' as const, refId: p.id, createdAtISO: p.createdAtISO, orgId: null })),
      ...eventsWithinRadius.map(e => ({ type: 'event' as const, refId: e.id, createdAtISO: e.dateISO, orgId: e.orgId })),
      ...pagePosts.map(pp => ({ type: 'page_post' as const, refId: pp.id, createdAtISO: pp.createdAtISO, orgId: pp.orgId })),
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
        .select('id, name, handle, avatar_url, city, interests, bio, is_certified')
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
        isCertified: (p as any).is_certified ?? false,
      }));
    }

    const hydratedCurrentUser = users[0] ?? { ...get().currentUser, isSuperAdmin };

    console.log('[_loadInitialData] Loaded:', {
      users: users.length,
      organizations: organizations.length,
      events: eventsWithinRadius.length,
      runPosts: runPosts.length,
      timelineItems: timelineItems.length,
    });

    // DEBUG: Log which posts have likedByCurrentUser set to true
    const likedPosts = runPosts.filter(p => p.likedByCurrentUser);
    console.log('[_loadInitialData] Posts marked as liked in state:', {
      totalLikedPosts: likedPosts.length,
      likedPostIds: likedPosts.map(p => ({ id: p.id, likedByCurrentUser: p.likedByCurrentUser }))
    });

    set((state) => ({
      users: [...users, ...extraUsers],
      organizations,
      events: eventsWithinRadius,
      runPosts,
      pagePosts,
      timelineItems,
      currentUser: hydratedCurrentUser,
      followingUserIds: followingUsers,
      defaultRunVisibility: resolvedRunVisibility,
      runState: {
        ...state.runState,
        visibility: resolvedRunVisibility,
      },
    }));
    } catch (error) {
      console.error('[_loadInitialData] Error loading data:', error);
      throw error;
    }
  },

  // Helper: Sync post like state from database
  _syncPostLikeState: async (postId: string) => {
    const state = get();
    const userId = state.currentUser.id;
    if (!userId) return false;

    // Query database to check if like actually exists
    const { data: likeData, error } = await supabase
      .from('run_post_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[_syncPostLikeState] Query failed:', error);
      return false;
    }

    const actuallyLiked = !!likeData;
    let target = state.runPosts.find(p => p.id === postId);
    
    if (target && target.likedByCurrentUser !== actuallyLiked) {
      console.log('[_syncPostLikeState] State mismatch detected, syncing:', {
        postId,
        localState: target.likedByCurrentUser,
        dbState: actuallyLiked
      });

      // Get current likes count from database
      const { data: postData } = await supabase
        .from('run_posts')
        .select('likes_count')
        .eq('id', postId)
        .maybeSingle();

      const dbLikesCount = postData?.likes_count ?? target.likes;

      // Sync state to match database
      set(({ runPosts }) => ({
        runPosts: runPosts.map(p => p.id === postId ? {
          ...p,
          likedByCurrentUser: actuallyLiked,
          likes: dbLikesCount,
        } : p)
      }));

      // Update cache to match database state
      await updateLikedPostsCache(userId, postId, actuallyLiked);

      return true; // State was synced
    }

    return false; // No sync needed
  },

  // Actions
  likeToggle: async (postId: string) => {
    const state = get();
    const userId = state.currentUser.id;
    if (!userId) {
      console.error('[likeToggle] No user ID');
      return;
    }
    let target = state.runPosts.find(p => p.id === postId);
    if (!target) {
      console.error('[likeToggle] Post not found:', postId);
      return;
    }

    const applyOptimisticUpdate = (nextLikedState: boolean) => {
      set(({ runPosts }) => ({
        runPosts: runPosts.map(p => p.id === postId ? {
          ...p,
          likedByCurrentUser: nextLikedState,
          likes: p.likes + (nextLikedState ? 1 : -1),
        } : p)
      }));
    };

    const revertOptimisticUpdate = (nextLikedState: boolean) => {
      set(({ runPosts }) => ({
        runPosts: runPosts.map(p => p.id === postId ? {
          ...p,
          likedByCurrentUser: !nextLikedState,
          likes: p.likes + (nextLikedState ? -1 : 1),
        } : p)
      }));
    };

    const persistLikeChange = async (nextLikedState: boolean) => {
      if (nextLikedState) {
        const { error } = await supabase.from('run_post_likes').insert({ post_id: postId, user_id: userId });
        if (error) {
          console.error('[likeToggle] Insert failed:', error);
          // Revert optimistic update before syncing to avoid inflated counts
          revertOptimisticUpdate(nextLikedState);
          if (error.code === '23505') {
            console.log('[likeToggle] Duplicate key error - like already exists, syncing state');
            await get()._syncPostLikeState(postId);
            await updateLikedPostsCache(userId, postId, true);
          }
          return;
        }
        await updateLikedPostsCache(userId, postId, true);
      } else {
        const { error } = await supabase.from('run_post_likes').delete().eq('post_id', postId).eq('user_id', userId);
        if (error) {
          console.error('[likeToggle] Delete failed:', error);
          revertOptimisticUpdate(nextLikedState);
          return;
        }
        await updateLikedPostsCache(userId, postId, false);
      }
    };

    // Verify database state before toggling to prevent state desync
    const stateSynced = await get()._syncPostLikeState(postId);
    if (stateSynced) {
      console.log('[likeToggle] State was synced, re-reading target');
      const updatedState = get();
      const updatedTarget = updatedState.runPosts.find(p => p.id === postId);
      if (!updatedTarget) {
        console.error('[likeToggle] Post not found after sync');
        return;
      }
      target = updatedTarget;
    }

    const desiredLikedState = !target.likedByCurrentUser;

    console.log('[likeToggle] Toggling like:', { postId, desiredLikedState });

    applyOptimisticUpdate(desiredLikedState);
    await persistLikeChange(desiredLikedState);
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

  deleteComment: async (postId: string, commentId: string) => {
    const userId = get().currentUser.id;
    if (!userId) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('post_id', postId).eq('user_id', userId);
    if (error) {
      console.warn('[deleteComment] delete failed', error);
      return;
    }
    set((state) => ({
      runPosts: state.runPosts.map(p => p.id === postId ? {
        ...p,
        comments: p.comments.filter(c => c.id !== commentId)
      } : p)
    }));
  },

  startRun: () => {
    const defaultVisibility = get().defaultRunVisibility || 'followers';
    set((state) => ({
      runState: {
        ...state.runState,
        isRunning: true,
        isPaused: false,
        startTime: Date.now(),
        accumulatedSeconds: 0,
        elapsedSeconds: 0,
        distanceKm: 0,
        currentPace: 5.5,
        currentSpeedKmh: 0,
        lastLocation: null,
        path: [],
        visibility: defaultVisibility,
      }
    }));
  },

  tickRun: () => {
    const state = get();
    if (!state.runState.isRunning || state.runState.isPaused || !state.runState.startTime) return;

    const now = Date.now();
    const elapsedMs = now - state.runState.startTime;
    const elapsedSeconds = state.runState.accumulatedSeconds + Math.floor(elapsedMs / 1000);
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

  pauseRun: () => {
    set((state) => {
      if (!state.runState.isRunning || state.runState.isPaused) return {} as Partial<AppState>;
      const now = Date.now();
      const accumulated = state.runState.startTime
        ? state.runState.accumulatedSeconds + Math.floor((now - state.runState.startTime) / 1000)
        : state.runState.accumulatedSeconds;
      return {
        runState: {
          ...state.runState,
          isPaused: true,
          startTime: null,
          accumulatedSeconds: accumulated,
          elapsedSeconds: accumulated,
        }
      };
    });
  },

  resumeRun: () => {
    set((state) => ({
      runState: {
        ...state.runState,
        isRunning: true,
        isPaused: false,
        startTime: Date.now(),
      }
    }));
  },

  onLocationUpdate: (lat: number, lon: number, timestampMs: number, accuracy?: number, speedMs?: number | null) => {
    const state = get();
    if (!state.runState.isRunning || state.runState.isPaused) return;
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
    const currentVisibility: RunVisibility =
      state.runState.visibility || state.defaultRunVisibility || 'followers';

    set((state) => ({
      runState: {
        ...state.runState,
        isRunning: false,
        isPaused: false,
        startTime: null,
        accumulatedSeconds: 0,
      }
    }));

    return {
      id: `run_${Date.now()}`,
      userId: state.currentUser.id,
      createdAtISO: new Date().toISOString(),
      distanceKm: Math.round(distanceKm * 100) / 100,
      durationMin: Math.round(elapsedSeconds / 60),
      avgPaceMinPerKm: Math.round(currentPace * 10) / 10,
      visibility: currentVisibility,
      likes: 0,
      likedByCurrentUser: false,
      comments: []
    };
  },

  postRun: async (caption: string, image?: string) => {
    const userId = get().currentUser.id;
    if (!userId) {
      console.error('[postRun] No user ID found');
      return false;
    }
    
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
    
    let mediaUrl: string | null = null;
    if (image) {
      console.log('[postRun] Uploading image:', image);
      if (/^https?:/i.test(image)) {
        mediaUrl = image;
        console.log('[postRun] Image is already a URL, using as-is');
      } else {
        try {
          const fileExt = (image.split('.').pop() || 'jpg').toLowerCase();
          const imagePath = `${userId}/runs/${(global as any).crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}.${fileExt}`;
          console.log('[postRun] Uploading to path:', imagePath);
          
          mediaUrl = await uploadImageToStorage(RUN_MEDIA_BUCKET, imagePath, image);
          
          if (!mediaUrl) {
            console.error('[postRun] Image upload failed - no URL returned');
          } else {
            console.log('[postRun] Image uploaded successfully:', mediaUrl);
          }
        } catch (error) {
          console.error('[postRun] Image upload error:', error);
          mediaUrl = null;
        }
      }
    }

    // If user selected an image but upload failed, return false
    if (image && !mediaUrl) {
      console.error('[postRun] Cannot post - image upload failed');
      return false;
    }

    const selectedVisibility: RunVisibility =
      get().runState.visibility || get().defaultRunVisibility || 'followers';

    const newRun = {
      user_id: userId,
      distance_km: distanceKm,
      duration_min: durationMin,
      avg_pace_min_per_km: avgPaceMinPerKm,
      activity_type: get().runState.activityType,
      visibility: selectedVisibility,
      route_preview_url: mediaUrl,
      caption: caption || null,
      is_from_partner: false,
      likes_count: 0,
    };
    try {
      const { data, error } = await supabase.from('run_posts').insert(newRun).select('*').single();
      if (error || !data) return false;

      let savedRoutePolyline: string | null = null;
      if (routePolyline) {
        const { error: routeError } = await supabase
          .from('run_routes')
          .upsert({
            run_id: data.id,
            route_polyline: routePolyline,
          });
        if (routeError) {
          console.error('[postRun] Failed to persist route geometry:', routeError);
        } else {
          savedRoutePolyline = routePolyline;
        }
      }
      const savedRoutePreview = data.route_preview_url ?? mediaUrl ?? null;

      const post: RunPost = {
        id: data.id,
        userId: data.user_id,
        createdAtISO: data.created_at,
        distanceKm: data.distance_km,
        durationMin: data.duration_min,
        avgPaceMinPerKm: data.avg_pace_min_per_km,
        visibility: (data.visibility as RunVisibility) || selectedVisibility,
        activityType: data.activity_type,
        routePolyline: savedRoutePolyline,
        routePreview: savedRoutePreview,
        caption: data.caption,
        likes: data.likes_count,
        likedByCurrentUser: false,
        comments: [],
      };
      const defaultVisibilityAfterPost = get().defaultRunVisibility || 'followers';
      set((state) => ({
        runPosts: [post, ...state.runPosts],
        timelineItems: [
          { type: 'run', refId: post.id, createdAtISO: post.createdAtISO },
          ...state.timelineItems
        ],
        runState: {
          ...state.runState,
          visibility: defaultVisibilityAfterPost,
        },
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
        if (error) throw new Error(error.message || 'Invalid email or password');
        const userId = data.user?.id || '';
        set((state) => ({
          isAuthenticated: true,
          currentUser: { ...state.currentUser, id: userId },
        }));
        // Ensure profile row exists to satisfy FKs and RLS
        if (userId) {
          const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
          if (!existing) {
            await supabase.from('profiles').insert({ id: userId, name: null });
          }
        }
        await get()._loadInitialData(userId);
      } else if (method === 'google') {
        // Get configuration
        const extra = (Constants.expoConfig?.extra ||
          (Constants as any)?.manifest?.extra ||
          (Constants as any)?.manifest2?.extra ||
          {}) as Record<string, string>;

        // Determine redirect URI based on platform
        const iosReversedScheme = extra.EXPO_PUBLIC_GOOGLE_IOS_REVERSED_SCHEME;
        const redirectUri = Platform.OS === 'ios' && iosReversedScheme
          ? `${iosReversedScheme}:/oauthredirect`
          : Linking.createURL('auth/callback');

        // Get Google client ID
        const googleClientId = extra.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 
          extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
          process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
          process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

        if (!googleClientId) {
          throw new Error('Missing Google OAuth client ID configuration');
        }

        console.log('[signIn:google] Starting OAuth flow', {
          platform: Platform.OS,
          redirectUri,
          clientId: googleClientId
        });

        console.log('[DEBUG] Full client ID:', googleClientId);
        console.log('[DEBUG] Reversed scheme:', iosReversedScheme);

        // iOS OAuth credentials only support authorization code flow (not implicit/id_token)
        // Step 1: Get authorization code from Google
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
          client_id: googleClientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'openid email profile',
        }).toString()}`;

        console.log('[DEBUG] Auth URL:', authUrl);
        console.log('[signIn:google] Opening OAuth URL in browser');

        // Open the OAuth URL in browser
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

        if (result.type !== 'success' || !result.url) {
          console.log('[signIn:google] User cancelled OAuth');
          throw new Error('Google sign-in was cancelled');
        }

        console.log('[signIn:google] OAuth completed, extracting authorization code');

        // Authorization code flow returns code in URL query string
        const urlParts = result.url.split('?');
        const params = new URLSearchParams(urlParts[1] || '');
        const code = params.get('code');

        if (!code) {
          console.error('[signIn:google] No authorization code in response');
          throw new Error('Failed to obtain authorization code from Google');
        }

        console.log('[signIn:google] Exchanging authorization code with Google for ID token');

        // Step 2: Exchange authorization code with Google's token endpoint to get ID token
        // Note: iOS apps don't have a client secret, so we use the code directly
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code: code,
            client_id: googleClientId,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }).toString(),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('[signIn:google] Token exchange failed:', errorText);
          throw new Error('Failed to exchange authorization code with Google');
        }

        const tokenData = await tokenResponse.json();
        const idToken = tokenData.id_token;

        if (!idToken) {
          console.error('[signIn:google] No ID token in Google response');
          throw new Error('Failed to obtain ID token from Google');
        }

        console.log('[signIn:google] Exchanging Google ID token with Supabase');

        // Step 3: Exchange Google ID token for Supabase session
        const { data: sessionData, error: sessionError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (sessionError || !sessionData?.session) {
          console.error('[signIn:google] Session error:', sessionError);
          throw new Error(sessionError?.message || 'Failed to create Supabase session');
        }

        const userId = sessionData.session.user.id;
        console.log('[signIn:google] Session established, userId:', userId);

        // Extract user metadata from Google
        const userMetadata = sessionData.session.user.user_metadata || {};
        const displayName = userMetadata.full_name || userMetadata.name || '';
        const avatarUrl = userMetadata.avatar_url || userMetadata.picture || '';

        console.log('[signIn:google] User metadata:', { 
          displayName, 
          avatarUrl: avatarUrl ? avatarUrl.substring(0, 30) + '...' : 'none' 
        });

        // Ensure profile exists without overwriting user's existing values
        try {
          const { data: existingProfile, error: fetchErr } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('id', userId)
            .maybeSingle();

          if (fetchErr) {
            console.warn('[signIn:google] Profile fetch error:', fetchErr);
          }

          if (!existingProfile) {
            // Create fresh profile with Google-provided defaults
            const { error: insertErr } = await supabase.from('profiles').insert({
              id: userId,
              name: (displayName || null),
              avatar_url: (avatarUrl || null),
            });
            if (insertErr) {
              console.error('[signIn:google] Profile insert error:', insertErr);
            }
          } else {
            // Only fill missing fields; never override user-selected values
            const updates: Record<string, any> = { id: userId };
            if ((!existingProfile.name || existingProfile.name === '') && displayName) {
              updates.name = displayName;
            }
            if ((!existingProfile.avatar_url || existingProfile.avatar_url === '') && avatarUrl) {
              updates.avatar_url = avatarUrl;
            }
            if (Object.keys(updates).length > 1) {
              const { error: updateErr } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' });
              if (updateErr) {
                console.error('[signIn:google] Profile update error:', updateErr);
              }
            }
          }
        } catch (profileEx) {
          console.error('[signIn:google] Profile ensure failed:', profileEx);
        }

        // Update local state
        set((state) => ({
          isAuthenticated: true,
          currentUser: { ...state.currentUser, id: userId },
          _currentSessionId: sessionData.session.access_token || null,
        }));

        console.log('[signIn:google] Loading initial data');
        await get()._loadInitialData(userId);
        console.log('[signIn:google] Sign in complete');
      }
    } catch (e: any) {
      console.error('[signIn] Error:', e?.message);
      set({ authError: e?.message || 'Authentication failed' });
      throw e;
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
      set((state) => ({
        isAuthenticated: true,
        currentUser: { ...state.currentUser, id: userId, name },
      }));
      await get()._loadInitialData(userId);
    } catch (e: any) {
      set({ authError: e?.message || 'Sign-up failed' });
    }
  },

  signOut: async () => {
    // Clear liked posts cache on sign out
    const userId = get().currentUser.id;
    if (userId) {
      try {
        await Promise.all([
          AsyncStorage.removeItem(getLikedPostsCacheKey(userId)),
          AsyncStorage.removeItem(getLikedPostsTimestampKey(userId))
        ]);
        console.log('[signOut] Cleared liked posts cache');
      } catch (error) {
        console.error('[signOut] Error clearing cache:', error);
      }
    }
    console.log('[signOut] Starting sign out...');
    try {
      // First clear local state immediately for responsive UI
      set({
        isAuthenticated: false,
        authError: null,
        users: [],
        organizations: [],
        events: [],
        runPosts: [],
        timelineItems: [],
        followingUserIds: [],
        currentUser: {
          id: '',
          name: null,
          handle: null,
          avatar: null,
          city: null,
          interests: [],
          followingOrgs: [],
          isSuperAdmin: false,
        },
      });
      console.log('[signOut] Local state cleared');
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[signOut] Supabase signOut error:', error);
        // Don't throw - we've already cleared local state
      } else {
        console.log('[signOut] Supabase sign out successful');
      }
    } catch (error) {
      console.error('[signOut] Unexpected error during sign out:', error);
    }
    console.log('[signOut] Sign out complete');
  },

  initializeAuth: async () => {
    // Get the initial session without triggering onAuthStateChange
    const { data } = await supabase.auth.getSession();
    const initialSession = data.session;
    const initialUserId = initialSession?.user?.id;
    
    console.log('[initializeAuth] Initial session check:', { hasSession: !!initialSession, userId: initialUserId });
    
    if (initialUserId) {
      // Set session ID to track this specific session
      set((state) => ({ 
        isAuthenticated: true, 
        currentUser: { ...state.currentUser, id: initialUserId },
        _currentSessionId: initialSession?.access_token || null,
      }));
      
      // Ensure profile exists
      try {
        const { data: existing } = await supabase.from('profiles').select('id').eq('id', initialUserId).maybeSingle();
        if (!existing) {
          await supabase.from('profiles').insert({ id: initialUserId, name: null });
        }
      } catch (err) {
        console.error('[initializeAuth] Profile check failed:', err);
      }
      
      // Load initial data
      try {
        set((state) => ({ _isLoadingData: true }));
        await get()._loadInitialData(initialUserId);
      } catch (err) {
        console.error('[initializeAuth] Failed to load initial data:', err);
      } finally {
        set((state) => ({ _isLoadingData: false }));
      }
    }
    
    // Set up auth state change listener WITHOUT async operations in the callback
    // This listener should only update UI state; data loading happens separately
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('[onAuthStateChange] Event:', event, 'hasSession:', !!session, 'userId:', session?.user?.id);
      
      const newSessionId = session?.access_token || null;
      const currentState = get();
      const sessionChanged = newSessionId !== currentState._currentSessionId;
      
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        const uid = session?.user?.id;
        if (uid && sessionChanged && !currentState._isLoadingData) {
          console.log('[onAuthStateChange] Session detected, scheduling data load for:', uid);
          
          // Update state immediately but don't await data loading
          set((state) => ({ 
            isAuthenticated: true, 
            currentUser: { ...state.currentUser, id: uid },
            _currentSessionId: newSessionId,
            _isLoadingData: true,
          }));
          
          // Schedule data loading separately to avoid blocking the callback
          // Use setTimeout to ensure this happens asynchronously
          setTimeout(async () => {
            try {
              console.log('[onAuthStateChange] Starting data load for session:', uid);
              
              // Ensure profile exists before loading data
              const { data: existing } = await supabase.from('profiles').select('id').eq('id', uid).maybeSingle();
              if (!existing) {
                await supabase.from('profiles').insert({ id: uid, name: null });
              }
              
              // Load all data
              await get()._loadInitialData(uid);
              console.log('[onAuthStateChange] Data load complete for:', uid);
            } catch (err) {
              console.error('[onAuthStateChange] Error during deferred data load:', err);
            } finally {
              set((state) => ({ _isLoadingData: false }));
            }
          }, 0);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[onAuthStateChange] User signed out');
        set({ 
          isAuthenticated: false, 
          users: [], 
          organizations: [], 
          events: [], 
          runPosts: [], 
          timelineItems: [], 
          followingUserIds: [],
          _currentSessionId: null,
          _isLoadingData: false,
          currentUser: {
            id: '',
            name: null,
            handle: null,
            avatar: null,
            city: null,
            interests: [],
            followingOrgs: [],
            isSuperAdmin: false,
          },
        });
      } else if (event === 'TOKEN_REFRESHED') {
        // Token was refreshed, update the session ID but don't reload data
        set((state) => ({ _currentSessionId: newSessionId }));
        console.log('[onAuthStateChange] Token refreshed');
      }
    });
  },

  hydratePreferences: async () => {
    try {
      const unit = await AsyncStorage.getItem(UNIT_PREFERENCE_KEY);
      const theme = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
      const accent = await AsyncStorage.getItem(ACCENT_PREFERENCE_KEY);
      const updates: Partial<AppState> = { hasHydratedTheme: true };

      if (unit === 'metric' || unit === 'imperial') {
        updates.unitPreference = unit;
      }
      if (theme === 'dark' || theme === 'light') {
        updates.themePreference = theme;
      }
      const isNamed = accent === 'blue' || accent === 'teal' || accent === 'violet' || accent === 'pink' || accent === 'orange' || accent === 'green';
      const isHex = !!accent && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(accent);
      if (isNamed || isHex) {
        updates.accentPreference = accent as AccentPreference;
      }

      set(updates);
    } catch {
      set({ hasHydratedTheme: true });
      // ignore hydration errors
    }
  },

  uploadAvatar: async (uri: string) => {
    const userId = get().currentUser.id;
    if (!userId) return null;
    const compressed = await compressAvatarImage(uri);
    const path = `${userId}/${Date.now()}.${compressed.fileExt}`;
    const displayUrl = await uploadImageToStorage('avatars', path, compressed.uri, compressed.mimeType);
    if (!displayUrl) return null;
    const cleanUrl = displayUrl.split('?')[0];
    // Update profile
    await supabase.from('profiles').update({ avatar_url: cleanUrl }).eq('id', userId);
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
      .select('id, name, handle, avatar_url, city, interests, is_certified')
      .ilike('name', `%${query}%`);
    // fetch following map
    const { data: following } = await supabase
      .from('user_follows')
      .select('followee_id')
      .eq('follower_id', uid);
    const followingSet = new Set((following || []).map(f => f.followee_id));
    return (data || []).map(p => ({ id: p.id, name: p.name, handle: p.handle, avatar: p.avatar_url, city: p.city, interests: p.interests ?? [], followingOrgs: [], isCertified: (p as any).is_certified ?? false, __following: followingSet.has(p.id) } as any));
  },
  searchOrganizations: async (query: string) => {
    const followingOrgs = new Set(get().currentUser.followingOrgs || []);
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, type, logo_url, city, website_url, owner_id, is_certified')
      .ilike('name', `%${query}%`);
    if (error) {
      console.warn('[searchOrganizations] query failed', error);
      return [];
    }
    return (data || []).map(o => ({
      id: o.id,
      name: o.name,
      type: o.type,
      logo: o.logo_url,
      city: o.city,
      website: o.website_url ?? null,
      ownerId: o.owner_id ?? undefined,
      isCertified: (o as any).is_certified ?? false,
      __following: followingOrgs.has(o.id),
    }) as any);
  },
  followUser: async (userIdToFollow: string) => {
    const userId = get().currentUser.id;
    if (!userId || userIdToFollow === userId) return false;
    if (get().followingUserIds.includes(userIdToFollow)) return true;
    const { error } = await supabase
      .from('user_follows')
      .insert({ follower_id: userId, followee_id: userIdToFollow });
    if (error && error.code !== '23505') {
      console.warn('[followUser] insert failed', error);
      return false;
    }
    // Confirm by re-querying (RLS-safe)
    const { data: confirm } = await supabase
      .from('user_follows')
      .select('followee_id')
      .eq('follower_id', userId)
      .eq('followee_id', userIdToFollow)
      .maybeSingle();
    if (!confirm) {
      console.warn('[followUser] confirm failed');
      return false;
    }
    set((state) => ({
      followingUserIds: state.followingUserIds.includes(userIdToFollow)
        ? state.followingUserIds
        : [...state.followingUserIds, userIdToFollow],
    }));
    return true;
  },
  unfollowUser: async (userIdToUnfollow: string) => {
    const userId = get().currentUser.id;
    if (!userId || userIdToUnfollow === userId) return false;
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', userId)
      .eq('followee_id', userIdToUnfollow);
    if (error) {
      console.warn('[unfollowUser] delete failed', error);
      return false;
    }
    set((state) => ({
      followingUserIds: state.followingUserIds.filter(id => id !== userIdToUnfollow),
    }));
    return true;
  },

  // Follow/Unfollow Pages (Organizations)
  followPage: async (orgId: string) => {
    const state = get();
    const userId = state.currentUser.id;
    if (!userId || !orgId) return false;
    if (state.currentUser.followingOrgs.includes(orgId)) return true;

    const prevFollowing = [...state.currentUser.followingOrgs];
    const nextFollowing = [...prevFollowing, orgId];
    const applyFollowing = (list: string[]) => {
      set((s) => ({
        currentUser: { ...s.currentUser, followingOrgs: list },
        users: s.users.map(u => u.id === userId ? { ...u, followingOrgs: list } : u),
      }));
    };

    applyFollowing(nextFollowing);

    const { error } = await supabase
      .from('user_following_organizations')
      .insert({ user_id: userId, org_id: orgId });
    if (error && error.code !== '23505') {
      console.warn('[followPage] insert failed', error);
      applyFollowing(prevFollowing);
      return false;
    }
    return true;
  },
  unfollowPage: async (orgId: string) => {
    const state = get();
    const userId = state.currentUser.id;
    if (!userId || !orgId) return false;

    const prevFollowing = [...state.currentUser.followingOrgs];
    if (!prevFollowing.includes(orgId)) return true;

    const nextFollowing = prevFollowing.filter(id => id !== orgId);
    const applyFollowing = (list: string[]) => {
      set((s) => ({
        currentUser: { ...s.currentUser, followingOrgs: list },
        users: s.users.map(u => u.id === userId ? { ...u, followingOrgs: list } : u),
      }));
    };

    applyFollowing(nextFollowing);

    const { error } = await supabase
      .from('user_following_organizations')
      .delete()
      .eq('user_id', userId)
      .eq('org_id', orgId);
    if (error) {
      console.warn('[unfollowPage] delete failed', error);
      applyFollowing(prevFollowing);
      return false;
    }
    return true;
  },

  // Page creation/update
  createPage: async ({ name, type, city, logoUri, website }: { name: string; type: Organization['type']; city: string; logoUri?: string; website?: string | null }) => {
    const userId = get().currentUser.id;
    if (!userId) return '';
    let logoUrl: string | null = null;
    if (logoUri) {
      const fileExt = (logoUri.split('.').pop() || 'jpg').toLowerCase();
      const path = `${userId}/pages/${Date.now()}/logo.${fileExt}`;
      logoUrl = await (async () => {
        const displayUrl = await uploadImageToStorage('page-logos', path, logoUri);
        return displayUrl ? displayUrl.split('?')[0] : null;
      })();
      if (!logoUrl) return '';
    }
    const payload: any = { name, type, city, logo_url: logoUrl, owner_id: userId };
    if (website !== undefined) payload.website_url = website; // only include if provided to avoid schema mismatch
    const { data, error } = await supabase
      .from('organizations')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) return '';
    const org: Organization = { id: data.id, name: data.name, type: data.type, logo: data.logo_url, city: data.city, website: (data as any).website_url ?? null, ownerId: data.owner_id };
    set((state) => ({ organizations: [org, ...state.organizations] }));
    return org.id;
  },

  updatePage: async (orgId: string, { name, city, logoUri, website }: { name?: string; city?: string; logoUri?: string; website?: string | null }) => {
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (city !== undefined) updates.city = city;
    if (website !== undefined) updates.website_url = website || null;
    if (logoUri) {
      const userId = get().currentUser.id;
      const fileExt = (logoUri.split('.').pop() || 'jpg').toLowerCase();
      const path = `${userId}/pages/${orgId}/${Date.now()}/logo.${fileExt}`;
      const displayUrl = await uploadImageToStorage('page-logos', path, logoUri);
      if (!displayUrl) return false;
      updates.logo_url = displayUrl.split('?')[0];
    }
    // Try update; if the remote schema doesn't yet have website_url, retry without it
    let { error, data } = await supabase.from('organizations').update(updates).eq('id', orgId).select('*').single();
    if (error && (updates.website_url !== undefined) && (error.message?.includes('website_url') || error.code === '42703')) {
      // remove unsupported column and retry once
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete updates.website_url;
      const retry = await supabase.from('organizations').update(updates).eq('id', orgId).select('*').single();
      error = retry.error as any;
      data = retry.data as any;
    }
    if (error) return false;
    set((state) => ({
      organizations: state.organizations.map(o => o.id === orgId ? { id: data.id, name: data.name, type: data.type, logo: data.logo_url, city: data.city, website: (data as any).website_url ?? null, ownerId: data.owner_id } : o),
    }));
    return true;
  },

  deletePage: async (orgId: string) => {
    const userId = get().currentUser.id;
    if (!userId) return false;
    const { data: org } = await supabase.from('organizations').select('owner_id').eq('id', orgId).maybeSingle();
    if (!org || org.owner_id !== userId) return false;
    const { error } = await supabase.from('organizations').delete().eq('id', orgId);
    if (error) return false;
    set((state) => ({
      organizations: state.organizations.filter(o => o.id !== orgId),
    }));
    return true;
  },

  // Event creation/update/delete
  createEvent: async (
    orgId: string,
    dto: { title: string; dateISO: string; city: string; location: { name: string; lat: number; lon: number }; tags: string[]; description?: string | null },
    coverUri?: string
  ) => {
    let coverUrl: string | null = null;
    if (coverUri) {
      const userId = get().currentUser.id;
      const fileExt = (coverUri.split('.').pop() || 'jpg').toLowerCase();
      const path = `${userId}/events/${Date.now()}/cover.${fileExt}`;
      const displayUrl = await uploadImageToStorage('event-covers', path, coverUri);
      if (!displayUrl) return false;
      coverUrl = displayUrl.split('?')[0];
    }
    const payload: any = {
      org_id: orgId,
      title: dto.title,
      date: dto.dateISO,
      city: dto.city,
      location_name: dto.location.name,
      location_lat: dto.location.lat,
      location_lon: dto.location.lon,
      tags: dto.tags,
      description: dto.description ?? null,
      cover_image_url: coverUrl,
    };
    const { data, error } = await supabase.from('events').insert(payload).select('*').single();
    if (error || !data) return false;
    const e: Event = {
      id: data.id,
      title: data.title,
      orgId: data.org_id,
      dateISO: data.date,
      city: data.city,
      location: { name: data.location_name, lat: data.location_lat, lon: data.location_lon },
      tags: data.tags || [],
      description: data.description,
      distanceFromUserKm: data.distance_from_user_km ?? null,
      coverImage: data.cover_image_url ?? null,
      createdByUserId: data.created_by ?? undefined,
    };
    set((state) => ({
      events: [e, ...state.events],
      timelineItems: [{ type: 'event', refId: e.id, createdAtISO: e.dateISO }, ...state.timelineItems],
    }));
    return true;
  },

  updateEvent: async (
    eventId: string,
    updates: Partial<{ title: string; dateISO: string; city: string; location: { name: string; lat: number; lon: number }; tags: string[]; description: string | null }>,
    coverUri?: string
  ) => {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.dateISO !== undefined) payload.date = updates.dateISO;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.location !== undefined) {
      payload.location_name = updates.location.name;
      payload.location_lat = updates.location.lat;
      payload.location_lon = updates.location.lon;
    }
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.description !== undefined) payload.description = updates.description;
    if (coverUri) {
      const userId = get().currentUser.id;
      const fileExt = (coverUri.split('.').pop() || 'jpg').toLowerCase();
      const path = `${userId}/events/${eventId}/cover.${fileExt}`;
      const displayUrl = await uploadImageToStorage('event-covers', path, coverUri);
      if (!displayUrl) return false;
      payload.cover_image_url = displayUrl.split('?')[0];
    }
    const { data, error } = await supabase.from('events').update(payload).eq('id', eventId).select('*').single();
    if (error || !data) return false;
    set((state) => ({
      events: state.events.map(ev => ev.id === eventId ? {
        id: data.id,
        title: data.title,
        orgId: data.org_id,
        dateISO: data.date,
        city: data.city,
        location: { name: data.location_name, lat: data.location_lat, lon: data.location_lon },
        tags: data.tags || [],
        description: data.description,
        distanceFromUserKm: data.distance_from_user_km ?? null,
        coverImage: data.cover_image_url ?? null,
        createdByUserId: data.created_by ?? undefined,
      } : ev),
      timelineItems: state.timelineItems.map(t => (t.type === 'event' && t.refId === eventId) ? { ...t, createdAtISO: data.date } : t),
    }));
    return true;
  },

  deleteEvent: async (eventId: string) => {
    const state = get();
    const ev = state.events.find(e => e.id === eventId);
    if (!ev) return false;
    const ownerId = state.currentUser.id;
    const ownsOrg = !!state.organizations.find(o => o.id === ev.orgId && o.ownerId === ownerId);
    const canDelete = ev.createdByUserId === ownerId || ownsOrg || state.currentUser.isSuperAdmin;
    if (!canDelete) return false;
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) return false;
    set((state) => ({
      events: state.events.filter(e => e.id !== eventId),
      timelineItems: state.timelineItems.filter(t => !(t.type === 'event' && t.refId === eventId)),
    }));
    return true;
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

  getFilteredEvents: (scope: 'forYou' | 'all' = get().eventFilter ?? 'all') => {
    const state = get();
    const radiusKm = (state.distanceRadiusMi || 10) * 1.60934;
    const sortEvents = (list: Event[]) => {
      const now = Date.now();
      return [...list].sort((a, b) => {
        const aSponsored = !!(a.sponsoredUntil && new Date(a.sponsoredUntil).getTime() > now && (!a.sponsoredFrom || new Date(a.sponsoredFrom).getTime() <= now));
        const bSponsored = !!(b.sponsoredUntil && new Date(b.sponsoredUntil).getTime() > now && (!b.sponsoredFrom || new Date(b.sponsoredFrom).getTime() <= now));
        if (aSponsored !== bSponsored) return aSponsored ? -1 : 1;
        if (state.currentUser?.isSuperAdmin) {
          const aPartner = state.orgById(a.orgId)?.type === 'partner' ? 1 : 0;
          const bPartner = state.orgById(b.orgId)?.type === 'partner' ? 1 : 0;
          if (aPartner !== bPartner) return bPartner - aPartner;
        }
        return 0;
      });
    };

    const byRadius = state.events.filter(e => e.distanceFromUserKm == null || e.distanceFromUserKm <= radiusKm);

    if (scope === 'all') {
      return sortEvents(byRadius);
    }

    const followingOrgSet = new Set(state.currentUser.followingOrgs || []);
    const interestSet = new Set((state.currentUser.interests || []) as string[]);
    // For You logic: item's orgId ∈ currentUser.followingOrgs OR tag intersects currentUser.interests
    const personalized = byRadius.filter(event => {
      const isFollowingOrg = followingOrgSet.has(event.orgId);
      const hasMatchingTags = event.tags.some(tag => interestSet.has(tag));

      return isFollowingOrg || hasMatchingTags;
    });

    return sortEvents(personalized);
  },

  getTimelineItems: (scope: 'all' | 'forYou') => {
    const state = get();
    const followingOrgSet = new Set(state.currentUser.followingOrgs || []);
    const followingUserSet = new Set(state.followingUserIds || []);
    const events = scope === 'all' ? state.events : state.getFilteredEvents('forYou');
    const runPosts = scope === 'all'
      ? state.runPosts
      : state.runPosts.filter(p => followingUserSet.has(p.userId));
    const pagePosts = scope === 'all'
      ? state.pagePosts
      : state.pagePosts.filter(pp => followingOrgSet.has(pp.orgId));

    const items: TimelineItem[] = [
      ...runPosts.map(p => ({ type: 'run' as const, refId: p.id, createdAtISO: p.createdAtISO, orgId: null })),
      ...events.map(e => ({ type: 'event' as const, refId: e.id, createdAtISO: e.dateISO, orgId: e.orgId })),
      ...pagePosts.map(pp => ({ type: 'page_post' as const, refId: pp.id, createdAtISO: pp.createdAtISO, orgId: pp.orgId })),
    ];

    const now = Date.now();
    const isSponsoredActive = (item: TimelineItem): boolean => {
      if (item.type === 'run') {
        const p = runPosts.find(r => r.id === item.refId);
        if (!p?.sponsoredUntil) return false;
        const from = p.sponsoredFrom ? new Date(p.sponsoredFrom).getTime() : -Infinity;
        const until = new Date(p.sponsoredUntil).getTime();
        return from <= now && until > now;
      } else if (item.type === 'event') {
        const e = events.find(ev => ev.id === item.refId);
        if (!e?.sponsoredUntil) return false;
        const from = e.sponsoredFrom ? new Date(e.sponsoredFrom).getTime() : -Infinity;
        const until = new Date(e.sponsoredUntil).getTime();
        return from <= now && until > now;
      } else {
        const pp = pagePosts.find(x => x.id === item.refId);
        if (!pp?.sponsoredUntil) return false;
        const from = pp.sponsoredFrom ? new Date(pp.sponsoredFrom).getTime() : -Infinity;
        const until = new Date(pp.sponsoredUntil).getTime();
        return from <= now && until > now;
      }
    };

    return items.sort((a, b) => {
      const aSponsored = isSponsoredActive(a);
      const bSponsored = isSponsoredActive(b);
      if (aSponsored !== bSponsored) return aSponsored ? -1 : 1;
      return new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime();
    });
  },

  ownedOrganizations: () => {
    const state = get();
    const ownerId = state.currentUser.id;
    if (!ownerId) return [];
    return state.organizations.filter(org => org.ownerId === ownerId);
  },

  manageableEvents: () => {
    const state = get();
    const ownerId = state.currentUser.id;
    if (!ownerId) return [];
    const ownedOrgIds = new Set(state.organizations.filter(o => o.ownerId === ownerId).map(o => o.id));
    return state.events.filter(ev => ev.createdByUserId === ownerId || ownedOrgIds.has(ev.orgId));
  },

  isParticipant: (_eventId: string) => true,
}));
