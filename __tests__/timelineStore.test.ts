jest.mock('expo/virtual/env', () => ({ env: {} }), { virtual: true });
jest.mock('expo-constants', () => ({ default: {} }), { virtual: true });
jest.mock('expo-linking', () => ({ openURL: jest.fn(), createURL: jest.fn() }), { virtual: true });
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn(), maybeCompleteAuthSession: jest.fn() }), { virtual: true });
jest.mock('expo-crypto', () => ({ getRandomBytesAsync: jest.fn(), randomUUID: () => 'uuid' }), { virtual: true });
jest.mock('react-native', () => ({ Platform: { OS: 'test' } }), { virtual: true });
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}), { virtual: true });
jest.mock('../utils/image', () => ({
  compressAvatarImage: jest.fn(),
}));
jest.mock('../supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  },
}));

import { useStore } from '../state/store';

const initialState = useStore.getState();

const baseEvent = {
  title: 'Test Event',
  city: 'Test City',
  location: { name: 'Test Location', lat: 0, lon: 0 },
  tags: [],
  description: null,
  distanceFromUserKm: null,
  coverImage: null,
};

describe('timeline personalization', () => {
  beforeEach(() => {
    useStore.setState(initialState, true);
  });

  it('only returns followed-organization events in the For You scope', () => {
    useStore.setState({
      currentUser: { ...initialState.currentUser, id: 'user-1', followingOrgs: ['org-keep'], interests: [] },
      events: [
        { ...baseEvent, id: 'event-keep', orgId: 'org-keep', dateISO: new Date().toISOString() },
        { ...baseEvent, id: 'event-skip', orgId: 'org-skip', dateISO: new Date().toISOString() },
      ],
      runPosts: [],
      pagePosts: [],
      followingUserIds: [],
    });

    const items = useStore.getState().getTimelineItems('forYou');
    const eventRefs = items.filter((item) => item.type === 'event').map((item) => item.refId);

    expect(eventRefs).toEqual(['event-keep']);
  });
});


