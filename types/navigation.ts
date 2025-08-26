export type RootStackParamList = {
  Events: undefined;
  Timeline: undefined;
  Run: undefined;
  Profile: undefined;
  EventDetails: { eventId: string };
  PostDetails: { postId: string };
  BusinessProfile: { orgId: string };
};

// For cross-stack navigation
export type AppNavigationParamList = {
  EventDetails: { eventId: string };
  PostDetails: { postId: string };
  BusinessProfile: { orgId: string };
  RunStats: { runId: string };
};

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetails: { eventId: string };
  BusinessProfile: { orgId: string };
};

export type TimelineStackParamList = {
  TimelineList: undefined;
  PostDetails: { postId: string };
  RunStats: { runId: string };
  EventDetails: { eventId: string };
  BusinessProfile: { orgId: string };
};

export type RunStackParamList = {
  RunTracker: undefined;
};

export type ProfileStackParamList = {
  UserProfile: undefined;
  RunnerProfile: { userId: string };
  PostDetails: { postId: string };
  RunStats: { runId: string };
  EventDetails: { eventId: string };
  BusinessProfile: { orgId: string };
  UserSearch: undefined;
};
