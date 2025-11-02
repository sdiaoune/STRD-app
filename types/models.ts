export type User = {
  id: string;
  name: string | null;
  handle: string | null;
  avatar: string | null;
  city: string | null;
  interests: string[] | null;
  followingOrgs: string[]; // derived from user_following_organizations
  bio?: string | null;
  isSuperAdmin?: boolean;
};

export type Organization = {
  id: string;
  name: string;
  type: 'community' | 'partner' | 'sponsor' | 'run_club';
  logo: string | null;
  city: string;
  website?: string | null;
  ownerId?: string;
};

export type Event = {
  id: string;
  title: string;
  orgId: string;
  dateISO: string; // ISO from timestamptz
  city: string;
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  tags: string[];
  description: string | null;
  distanceFromUserKm: number | null;
  coverImage?: string | null;
  createdByUserId?: string;
};

export type Comment = {
  id: string;
  userId: string;
  text: string;
  createdAtISO: string;
};

export type RunPost = {
  id: string;
  userId: string;
  createdAtISO: string;
  distanceKm: number;
  durationMin: number;
  avgPaceMinPerKm: number;
  activityType?: 'run' | 'walk';
  routePolyline?: string | null;
  routePreview?: string | null;
  caption?: string | null;
  likes: number;
  likedByCurrentUser: boolean;
  comments: Comment[];
  isFromPartner?: boolean;
};

export type TimelineItem = {
  type: 'run' | 'event';
  refId: string;
  createdAtISO: string;
};


