export type User = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  city: string;
  interests: string[];
  followingOrgs: string[];
};

export type Organization = {
  id: string;
  name: string;
  type: "community" | "partner";
  logo: string;
  city: string;
};

export type Event = {
  id: string;
  title: string;
  orgId: string;
  dateISO: string;
  city: string;
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  tags: string[];
  description: string;
  distanceFromUserKm: number;
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
  routePreview?: string;
  caption?: string;
  likes: number;
  likedByCurrentUser: boolean;
  comments: Comment[];
  isFromPartner?: boolean;
};

export type TimelineItem = {
  type: "run" | "event";
  refId: string;
  createdAtISO: string;
};

// Mock Data
export const users: User[] = [
  {
    id: "user1",
    name: "Alex Chen",
    handle: "@alexrunner",
    avatar: "https://i.pravatar.cc/150?img=1",
    city: "San Francisco",
    interests: ["5K", "Tempo", "Wellness"],
    followingOrgs: ["org1", "org3", "org5"]
  },
  {
    id: "user2",
    name: "Sarah Johnson",
    handle: "@sarahj",
    avatar: "https://i.pravatar.cc/150?img=2",
    city: "San Francisco",
    interests: ["Trail", "Marathon", "Wellness"],
    followingOrgs: ["org2", "org4"]
  },
  {
    id: "user3",
    name: "Mike Rodriguez",
    handle: "@mikerun",
    avatar: "https://i.pravatar.cc/150?img=3",
    city: "San Francisco",
    interests: ["5K", "Sprint", "Wellness"],
    followingOrgs: ["org1", "org6"]
  },
  {
    id: "user4",
    name: "Emma Wilson",
    handle: "@emmaw",
    avatar: "https://i.pravatar.cc/150?img=4",
    city: "San Francisco",
    interests: ["Trail", "Long Distance", "Wellness"],
    followingOrgs: ["org3", "org5"]
  },
  {
    id: "user5",
    name: "David Kim",
    handle: "@davidk",
    avatar: "https://i.pravatar.cc/150?img=5",
    city: "San Francisco",
    interests: ["5K", "Tempo", "Sprint"],
    followingOrgs: ["org2", "org4", "org6"]
  },
  {
    id: "user6",
    name: "Lisa Park",
    handle: "@lisap",
    avatar: "https://i.pravatar.cc/150?img=6",
    city: "San Francisco",
    interests: ["Marathon", "Long Distance", "Wellness"],
    followingOrgs: ["org1", "org3"]
  },
  {
    id: "user7",
    name: "Tom Anderson",
    handle: "@tomand",
    avatar: "https://i.pravatar.cc/150?img=7",
    city: "San Francisco",
    interests: ["Trail", "5K", "Wellness"],
    followingOrgs: ["org5", "org6"]
  },
  {
    id: "user8",
    name: "Current User",
    handle: "@currentuser",
    avatar: "https://i.pravatar.cc/150?img=8",
    city: "San Francisco",
    interests: ["5K", "Tempo", "Wellness", "Trail"],
    followingOrgs: ["org1", "org3", "org5"]
  }
];

export const organizations: Organization[] = [
  {
    id: "org1",
    name: "Volt Athletics",
    type: "partner",
    logo: "https://i.pravatar.cc/150?img=10",
    city: "San Francisco"
  },
  {
    id: "org2",
    name: "SF Running Club",
    type: "community",
    logo: "https://i.pravatar.cc/150?img=11",
    city: "San Francisco"
  },
  {
    id: "org3",
    name: "Nike Running",
    type: "partner",
    logo: "https://i.pravatar.cc/150?img=12",
    city: "San Francisco"
  },
  {
    id: "org4",
    name: "Golden Gate Runners",
    type: "community",
    logo: "https://i.pravatar.cc/150?img=13",
    city: "San Francisco"
  },
  {
    id: "org5",
    name: "Adidas Running",
    type: "partner",
    logo: "https://i.pravatar.cc/150?img=14",
    city: "San Francisco"
  },
  {
    id: "org6",
    name: "Bay Area Trail Runners",
    type: "community",
    logo: "https://i.pravatar.cc/150?img=15",
    city: "San Francisco"
  },
  {
    id: "org7",
    name: "Wellness Collective",
    type: "community",
    logo: "https://i.pravatar.cc/150?img=16",
    city: "San Francisco"
  },
  {
    id: "org8",
    name: "Marathon Training Group",
    type: "community",
    logo: "https://i.pravatar.cc/150?img=17",
    city: "San Francisco"
  }
];

export const events: Event[] = [
  {
    id: "event1",
    title: "Morning 5K Tempo Run",
    orgId: "org1",
    dateISO: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    city: "San Francisco",
    location: {
      name: "Golden Gate Park",
      lat: 37.7694,
      lon: -122.4862
    },
    tags: ["5K", "Tempo", "Morning"],
    description: "Join us for an energizing morning tempo run through Golden Gate Park. Perfect for runners looking to improve their pace.",
    distanceFromUserKm: 2.1
  },
  {
    id: "event2",
    title: "Trail Running Workshop",
    orgId: "org6",
    dateISO: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    city: "San Francisco",
    location: {
      name: "Mount Tamalpais",
      lat: 37.8915,
      lon: -122.5770
    },
    tags: ["Trail", "Workshop", "Beginner"],
    description: "Learn the basics of trail running with experienced guides. Includes technique tips and safety guidelines.",
    distanceFromUserKm: 15.3
  },
  {
    id: "event3",
    title: "Wellness & Recovery Session",
    orgId: "org7",
    dateISO: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    city: "San Francisco",
    location: {
      name: "Marina Green",
      lat: 37.8063,
      lon: -122.4399
    },
    tags: ["Wellness", "Recovery", "Yoga"],
    description: "Post-run recovery session with stretching, yoga, and wellness tips for runners.",
    distanceFromUserKm: 1.8
  },
  {
    id: "event4",
    title: "Nike Speed Training",
    orgId: "org3",
    dateISO: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    city: "San Francisco",
    location: {
      name: "Kezar Stadium",
      lat: 37.7636,
      lon: -122.4568
    },
    tags: ["Sprint", "Speed", "Training"],
    description: "High-intensity speed training session with Nike coaches. Improve your sprint times and overall performance.",
    distanceFromUserKm: 3.2
  },
  {
    id: "event5",
    title: "Long Distance Group Run",
    orgId: "org8",
    dateISO: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    city: "San Francisco",
    location: {
      name: "Crissy Field",
      lat: 37.8068,
      lon: -122.4652
    },
    tags: ["Long Distance", "Marathon", "Group"],
    description: "Long distance training run for marathon preparation. Multiple pace groups available.",
    distanceFromUserKm: 2.5
  },
  {
    id: "event6",
    title: "Adidas Community Run",
    orgId: "org5",
    dateISO: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    city: "San Francisco",
    location: {
      name: "Embarcadero",
      lat: 37.7952,
      lon: -122.4029
    },
    tags: ["5K", "Community", "Social"],
    description: "Casual community run along the Embarcadero. All paces welcome, followed by coffee and socializing.",
    distanceFromUserKm: 0.8
  },
  {
    id: "event7",
    title: "SF Running Club Weekly Meet",
    orgId: "org2",
    dateISO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    city: "San Francisco",
    location: {
      name: "Dolores Park",
      lat: 37.7597,
      lon: -122.4270
    },
    tags: ["5K", "Social", "Weekly"],
    description: "Weekly social run with the SF Running Club. Great way to meet fellow runners in the area.",
    distanceFromUserKm: 1.2
  },
  {
    id: "event8",
    title: "Golden Gate Bridge Run",
    orgId: "org4",
    dateISO: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    city: "San Francisco",
    location: {
      name: "Golden Gate Bridge",
      lat: 37.8199,
      lon: -122.4783
    },
    tags: ["Scenic", "Bridge", "Photography"],
    description: "Scenic run across the Golden Gate Bridge. Don't forget your camera for amazing views!",
    distanceFromUserKm: 5.7
  },
  {
    id: "event9",
    title: "Volt Athletics Performance Clinic",
    orgId: "org1",
    dateISO: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    city: "San Francisco",
    location: {
      name: "Presidio",
      lat: 37.7989,
      lon: -122.4662
    },
    tags: ["Performance", "Clinic", "Advanced"],
    description: "Advanced performance clinic focusing on running form, efficiency, and injury prevention.",
    distanceFromUserKm: 4.1
  },
  {
    id: "event10",
    title: "Wellness & Nutrition Talk",
    orgId: "org7",
    dateISO: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    city: "San Francisco",
    location: {
      name: "Fort Mason",
      lat: 37.8065,
      lon: -122.4310
    },
    tags: ["Wellness", "Nutrition", "Education"],
    description: "Learn about proper nutrition for runners and how to fuel your training effectively.",
    distanceFromUserKm: 2.9
  },
  {
    id: "event11",
    title: "Trail Running Adventure",
    orgId: "org6",
    dateISO: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
    city: "San Francisco",
    location: {
      name: "Lands End",
      lat: 37.7786,
      lon: -122.5115
    },
    tags: ["Trail", "Adventure", "Scenic"],
    description: "Adventure trail run through Lands End with stunning ocean views and challenging terrain.",
    distanceFromUserKm: 6.3
  },
  {
    id: "event12",
    title: "Nike Recovery & Stretching",
    orgId: "org3",
    dateISO: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    city: "San Francisco",
    location: {
      name: "Alamo Square",
      lat: 37.7761,
      lon: -122.4346
    },
    tags: ["Recovery", "Stretching", "Wellness"],
    description: "Recovery session focusing on stretching, mobility, and injury prevention techniques.",
    distanceFromUserKm: 2.7
  }
];

export const runPosts: RunPost[] = [
  {
    id: "run1",
    userId: "user1",
    createdAtISO: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    distanceKm: 5.2,
    durationMin: 28,
    avgPaceMinPerKm: 5.4,
    routePreview: "https://i.pravatar.cc/300?img=20",
    caption: "Great morning run! The weather was perfect for a tempo session. 🏃‍♂️",
    likes: 12,
    likedByCurrentUser: false,
    comments: [
      { id: "c1", userId: "user2", text: "Nice pace! 🔥", createdAtISO: new Date().toISOString() },
      { id: "c2", userId: "user3", text: "Beautiful route!", createdAtISO: new Date().toISOString() }
    ]
  },
  {
    id: "run2",
    userId: "user2",
    createdAtISO: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    distanceKm: 8.7,
    durationMin: 52,
    avgPaceMinPerKm: 6.0,
    routePreview: "https://i.pravatar.cc/300?img=21",
    caption: "Long run along the coast. The views were incredible! 🌊",
    likes: 8,
    likedByCurrentUser: false,
    comments: [
      { id: "c3", userId: "user1", text: "Amazing distance!", createdAtISO: new Date().toISOString() }
    ]
  },
  {
    id: "run3",
    userId: "user3",
    createdAtISO: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    distanceKm: 3.1,
    durationMin: 15,
    avgPaceMinPerKm: 4.8,
    routePreview: "https://i.pravatar.cc/300?img=22",
    caption: "Quick sprint session. Feeling fast today! ⚡",
    likes: 15,
    likedByCurrentUser: false,
    comments: [
      { id: "c4", userId: "user4", text: "Incredible pace!", createdAtISO: new Date().toISOString() },
      { id: "c5", userId: "user5", text: "You're on fire! 🔥", createdAtISO: new Date().toISOString() }
    ]
  },
  {
    id: "run4",
    userId: "user4",
    createdAtISO: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    distanceKm: 12.5,
    durationMin: 78,
    avgPaceMinPerKm: 6.2,
    routePreview: "https://i.pravatar.cc/300?img=23",
    caption: "Trail run in the mountains. Challenging but rewarding! 🏔️",
    likes: 6,
    likedByCurrentUser: false,
    comments: [
      { id: "c6", userId: "user6", text: "Beautiful trail!", createdAtISO: new Date().toISOString() }
    ]
  },
  {
    id: "run5",
    userId: "user5",
    createdAtISO: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    distanceKm: 6.8,
    durationMin: 38,
    avgPaceMinPerKm: 5.6,
    routePreview: "https://i.pravatar.cc/300?img=24",
    caption: "Evening run through the city. Love the energy! 🌃",
    likes: 9,
    likedByCurrentUser: false,
    comments: [
      { id: "c7", userId: "user1", text: "City runs are the best!", createdAtISO: new Date().toISOString() },
      { id: "c8", userId: "user7", text: "Great pace for an evening run!", createdAtISO: new Date().toISOString() }
    ]
  },
  {
    id: "run6",
    userId: "user6",
    createdAtISO: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    distanceKm: 21.1,
    durationMin: 142,
    avgPaceMinPerKm: 6.7,
    routePreview: "https://i.pravatar.cc/300?img=25",
    caption: "Half marathon training run. Building endurance! 💪",
    likes: 18,
    likedByCurrentUser: false,
    comments: [
      { id: "c9", userId: "user2", text: "Amazing distance!", createdAtISO: new Date().toISOString() },
      { id: "c10", userId: "user4", text: "You're ready for the race!", createdAtISO: new Date().toISOString() }
    ]
  },
  {
    id: "run7",
    userId: "user7",
    createdAtISO: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    distanceKm: 4.2,
    durationMin: 22,
    avgPaceMinPerKm: 5.2,
    routePreview: "https://i.pravatar.cc/300?img=26",
    caption: "Recovery run after yesterday's long session. Feeling good! 😊",
    likes: 5,
    likedByCurrentUser: false,
    comments: [
      { id: "c11", userId: "user3", text: "Smart recovery!", createdAtISO: new Date().toISOString() }
    ]
  },
  {
    id: "run8",
    userId: "user1",
    createdAtISO: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    distanceKm: 7.5,
    durationMin: 42,
    avgPaceMinPerKm: 5.6,
    routePreview: "https://i.pravatar.cc/300?img=27",
    caption: "Group run with the club. Always more fun with friends! 👥",
    likes: 11,
    likedByCurrentUser: false,
    comments: [
      { id: "c12", userId: "user5", text: "Group runs are the best!", createdAtISO: new Date().toISOString() },
      { id: "c13", userId: "user6", text: "Great energy today!", createdAtISO: new Date().toISOString() }
    ]
  },
  {
    id: "run9",
    userId: "user2",
    createdAtISO: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    distanceKm: 9.3,
    durationMin: 55,
    avgPaceMinPerKm: 5.9,
    routePreview: "https://i.pravatar.cc/300?img=28",
    caption: "Hill training session. Those inclines are tough! ⛰️",
    likes: 7,
    likedByCurrentUser: false,
    comments: [
      { id: "c14", userId: "user4", text: "Hill training builds strength!", createdAtISO: new Date().toISOString() }
    ]
  },
  {
    id: "run10",
    userId: "user3",
    createdAtISO: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    distanceKm: 5.0,
    durationMin: 26,
    avgPaceMinPerKm: 5.2,
    routePreview: "https://i.pravatar.cc/300?img=29",
    caption: "Perfect 5K time! New personal best! 🎉",
    likes: 20,
    likedByCurrentUser: false,
    comments: [
      { id: "c15", userId: "user1", text: "Congratulations! 🎉", createdAtISO: new Date().toISOString() },
      { id: "c16", userId: "user7", text: "Amazing achievement!", createdAtISO: new Date().toISOString() }
    ]
  },
  {
    id: "run11",
    userId: "user4",
    createdAtISO: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    distanceKm: 15.2,
    durationMin: 95,
    avgPaceMinPerKm: 6.2,
    routePreview: "https://i.pravatar.cc/300?img=30",
    caption: "Long run along the coast. Perfect weather and great company! 🌊",
    likes: 13,
    likedByCurrentUser: false,
    comments: [
      { id: "c17", userId: "user2", text: "Beautiful route!", createdAtISO: new Date().toISOString() },
      { id: "c18", userId: "user5", text: "Great distance!", createdAtISO: new Date().toISOString() }
    ]
  },
  {
    id: "run12",
    userId: "user5",
    createdAtISO: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    distanceKm: 3.8,
    durationMin: 20,
    avgPaceMinPerKm: 5.3,
    routePreview: "https://i.pravatar.cc/300?img=31",
    caption: "Quick morning run to start the day right! ☀️",
    likes: 8,
    likedByCurrentUser: false,
    comments: [
      { id: "c19", userId: "user1", text: "Perfect way to start the day!", createdAtISO: new Date().toISOString() }
    ]
  },
  {
    id: "run13",
    userId: "user6",
    createdAtISO: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    distanceKm: 18.5,
    durationMin: 118,
    avgPaceMinPerKm: 6.4,
    routePreview: "https://i.pravatar.cc/300?img=32",
    caption: "Marathon training continues. Building that endurance! 🏃‍♀️",
    likes: 16,
    likedByCurrentUser: false,
    comments: [
      { id: "c20", userId: "user3", text: "You're crushing it!", createdAtISO: new Date().toISOString() },
      { id: "c21", userId: "user7", text: "Marathon ready! 💪", createdAtISO: new Date().toISOString() }
    ]
  },
  {
    id: "run14",
    userId: "user7",
    createdAtISO: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    distanceKm: 6.2,
    durationMin: 35,
    avgPaceMinPerKm: 5.6,
    routePreview: "https://i.pravatar.cc/300?img=33",
    caption: "Evening tempo run. The city lights were magical! ✨",
    likes: 10,
    likedByCurrentUser: false,
    comments: [
      { id: "c22", userId: "user2", text: "Night runs are special!", createdAtISO: new Date().toISOString() },
      { id: "c23", userId: "user4", text: "Beautiful pace!", createdAtISO: new Date().toISOString() }
    ]
  }
];

export const timelineItems: TimelineItem[] = [
  { type: "run" as const, refId: "run1", createdAtISO: runPosts[0].createdAtISO },
  { type: "event" as const, refId: "event1", createdAtISO: events[0].dateISO },
  { type: "run" as const, refId: "run2", createdAtISO: runPosts[1].createdAtISO },
  { type: "event" as const, refId: "event2", createdAtISO: events[1].dateISO },
  { type: "run" as const, refId: "run3", createdAtISO: runPosts[2].createdAtISO },
  { type: "event" as const, refId: "event3", createdAtISO: events[2].dateISO },
  { type: "run" as const, refId: "run4", createdAtISO: runPosts[3].createdAtISO },
  { type: "event" as const, refId: "event4", createdAtISO: events[3].dateISO },
  { type: "run" as const, refId: "run5", createdAtISO: runPosts[4].createdAtISO },
  { type: "event" as const, refId: "event5", createdAtISO: events[4].dateISO },
  { type: "run" as const, refId: "run6", createdAtISO: runPosts[5].createdAtISO },
  { type: "event" as const, refId: "event6", createdAtISO: events[5].dateISO },
  { type: "run" as const, refId: "run7", createdAtISO: runPosts[6].createdAtISO },
  { type: "run" as const, refId: "run8", createdAtISO: runPosts[7].createdAtISO },
  { type: "run" as const, refId: "run9", createdAtISO: runPosts[8].createdAtISO },
  { type: "run" as const, refId: "run10", createdAtISO: runPosts[9].createdAtISO },
  { type: "run" as const, refId: "run11", createdAtISO: runPosts[10].createdAtISO },
  { type: "run" as const, refId: "run12", createdAtISO: runPosts[11].createdAtISO },
  { type: "run" as const, refId: "run13", createdAtISO: runPosts[12].createdAtISO },
  { type: "run" as const, refId: "run14", createdAtISO: runPosts[13].createdAtISO }
].sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime());
