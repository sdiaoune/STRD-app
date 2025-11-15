import { useStore } from '../state/store';

const mockRunPostsInsert = jest.fn();

jest.mock('../supabase/client', () => {
  const mockSingle = (data: any) => ({
    single: jest.fn().mockResolvedValue({ data, error: null }),
  });

  return {
    supabase: {
      from: (table: string) => {
        if (table === 'run_posts') {
          return {
            insert: (payload: any) => {
              mockRunPostsInsert(payload);
              return {
                select: () =>
                  mockSingle({
                    ...payload,
                    id: 'run_mock',
                    user_id: payload.user_id,
                    created_at: '2024-01-01T00:00:00Z',
                  }),
              };
            },
          };
        }
        return {
          insert: () => Promise.resolve({ data: null, error: null }),
          update: () => Promise.resolve({ error: null }),
          delete: () => Promise.resolve({ error: null }),
          upsert: () => Promise.resolve({ error: null }),
          select: () => mockSingle(null),
        };
      },
      storage: {
        from: () => ({
          upload: jest.fn(),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
      auth: {
        signInWithPassword: jest.fn(),
      },
    },
  };
});

describe('run visibility workflow', () => {
  beforeEach(() => {
    mockRunPostsInsert.mockClear();
    useStore.setState((state) => ({
      currentUser: { ...state.currentUser, id: 'user-123' },
      runPosts: [],
      timelineItems: [],
      defaultRunVisibility: 'followers',
      runState: {
        ...state.runState,
        visibility: 'followers',
        distanceKm: 5,
        elapsedSeconds: 1500,
        accumulatedSeconds: 1500,
        currentPace: 5,
        path: [],
      },
    }));
  });

  it('persists the selected visibility when posting a run', async () => {
    useStore.getState().setRunVisibility('public');

    const ok = await useStore.getState().postRun('Visibility test');

    expect(ok).toBe(true);
    expect(mockRunPostsInsert).toHaveBeenCalledWith(expect.objectContaining({ visibility: 'public' }));

    const latestPost = useStore.getState().runPosts[0];
    expect(latestPost.visibility).toBe('public');
    expect(useStore.getState().runState.visibility).toBe('followers');
  });
});


