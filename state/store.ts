import { create } from 'zustand';
import { 
  users, 
  organizations, 
  events, 
  runPosts, 
  timelineItems,
  type User,
  type Organization,
  type Event,
  type RunPost,
  type TimelineItem,
  type Comment
} from '../data/mock';

interface RunState {
  isRunning: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  distanceKm: number;
  currentPace: number;
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
  
  // Actions
  likeToggle: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  startRun: () => void;
  tickRun: () => void;
  endRun: () => RunPost;
  postRun: (caption: string, image?: string) => void;
  filterEvents: (scope: 'forYou' | 'all') => void;
  
  // Helpers
  eventById: (id: string) => Event | undefined;
  postById: (id: string) => RunPost | undefined;
  orgById: (id: string) => Organization | undefined;
  userById: (id: string) => User | undefined;
  getFilteredEvents: () => Event[];
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  users,
  organizations,
  events,
  runPosts,
  timelineItems,
  currentUser: users.find(u => u.id === 'user8')!,
  eventFilter: 'forYou',
  runState: {
    isRunning: false,
    startTime: null,
    elapsedSeconds: 0,
    distanceKm: 0,
    currentPace: 5.5
  },

  // Actions
  likeToggle: (postId: string) => {
    set((state) => ({
      runPosts: state.runPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              likedByCurrentUser: !post.likedByCurrentUser,
              likes: post.likes + (post.likedByCurrentUser ? -1 : 1)
            }
          : post
      )
    }));
  },

  addComment: (postId: string, text: string) => {
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      userId: get().currentUser.id,
      text,
      createdAtISO: new Date().toISOString(),
    };

    set((state) => ({
      runPosts: state.runPosts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    }));
  },

  startRun: () => {
    set((state) => ({
      runState: {
        ...state.runState,
        isRunning: true,
        startTime: Date.now(),
        elapsedSeconds: 0,
        distanceKm: 0,
        currentPace: 5.5
      }
    }));
  },

  tickRun: () => {
    const state = get();
    if (!state.runState.isRunning || !state.runState.startTime) return;

    const now = Date.now();
    const elapsedMs = now - state.runState.startTime;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    
    // Simulate distance increase (0.01-0.03 km per second)
    const distanceIncrease = 0.01 + Math.random() * 0.02;
    const newDistance = state.runState.distanceKm + distanceIncrease;
    
    // Simulate pace variation (4:30-6:30 min/km)
    const paceVariation = 4.5 + Math.random() * 2;
    
    set((state) => ({
      runState: {
        ...state.runState,
        elapsedSeconds,
        distanceKm: newDistance,
        currentPace: paceVariation
      }
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

  postRun: (caption: string, image?: string) => {
    const newRun: RunPost = {
      id: `run_${Date.now()}`,
      userId: get().currentUser.id,
      createdAtISO: new Date().toISOString(),
      distanceKm: Math.round(get().runState.distanceKm * 100) / 100,
      durationMin: Math.round(get().runState.elapsedSeconds / 60),
      avgPaceMinPerKm: Math.round(get().runState.currentPace * 10) / 10,
      routePreview: image,
      caption,
      likes: 0,
      likedByCurrentUser: false,
      comments: []
    };

    set((state) => ({
      runPosts: [newRun, ...state.runPosts],
      timelineItems: [
        { type: 'run', refId: newRun.id, createdAtISO: newRun.createdAtISO },
        ...state.timelineItems
      ]
    }));
  },

  filterEvents: (scope: 'forYou' | 'all') => {
    set({ eventFilter: scope });
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
  }
}));
