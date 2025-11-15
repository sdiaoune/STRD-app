# Google OAuth Race Condition Fix

## Problem Summary

The app was not loading data until after a refresh when users authenticated via Google OAuth. This was caused by three interconnected issues in the authentication flow:

### 1. **Async/Await Deadlock in `onAuthStateChange`**
   - The callback had `await` calls which create a deadlock in Supabase JS
   - Any async API call in `onAuthStateChange` blocks the next Supabase call globally
   - This is a known bug in supabase-js: https://github.com/supabase/gotrue-js/issues/762

### 2. **Incorrect Duplicate Detection Logic**
   - The code compared `access_token` values between sessions
   - Supabase **refreshes tokens automatically**, so the same user session will have different tokens
   - This caused unnecessary duplicate checks that skipped data loading

### 3. **Race Condition Timing**
   When Google OAuth completed:
   ```
   1. Browser completes OAuth redirect
   2. Supabase implicit flow extracts tokens from URL fragment
   3. signInWithIdToken() is called manually in sign-in.tsx
   4. Manual set() updates state with userId
   5. Supabase automatically triggers onAuthStateChange SIGNED_IN event
   6. onAuthStateChange was also calling set() and _loadInitialData()
   7. Two simultaneous data load operations race against each other
   8. One completes before profile is fully ready → incomplete data
   ```

## Solution: Implicit Flow with Deferred Data Loading

### Key Changes

#### 1. **Session Tracking Instead of Token Comparison**
```typescript
// Added to AppState interface
_currentSessionId: string | null;  // Track current session ID
_isLoadingData: boolean;           // Prevent duplicate data loads
```

The session ID (access_token) is used only to detect **if the session changed**, not to compare values:
```typescript
const newSessionId = session?.access_token || null;
const sessionChanged = newSessionId !== currentState._currentSessionId;
```

#### 2. **Removed Async/Await from `onAuthStateChange`**
```typescript
// BEFORE (❌ Causes deadlock)
supabase.auth.onAuthStateChange(async (event, session) => {
  await get()._loadInitialData(uid);  // Deadlock!
});

// AFTER (✅ Non-blocking callback)
supabase.auth.onAuthStateChange((event, session) => {
  // Only synchronous state updates here
  set((state) => ({...}));
  
  // Schedule async work separately with setTimeout
  setTimeout(async () => {
    await get()._loadInitialData(uid);
  }, 0);
});
```

#### 3. **Deferred Data Loading**
- Data loading is scheduled with `setTimeout(..., 0)` 
- This runs **asynchronously outside the callback** 
- Prevents blocking the Supabase auth flow
- Avoids the deadlock issue entirely

#### 4. **Implicit Flow Compliance**
```typescript
// In signIn(google):
// After exchanging id_token with signInWithIdToken():

// ✅ DO: Track session ID
set((state) => ({
  authError: null,
  _currentSessionId: sessionId,
}));

// ❌ DON'T: Manually load data
// await get()._loadInitialData(userId);  // Let onAuthStateChange handle this

// ✅ Let onAuthStateChange callback take over
// It will be triggered automatically by Supabase after signInWithIdToken
```

## Implementation Details

### initializeAuth() - New Flow

1. **Get Initial Session** (without triggering callbacks)
   ```typescript
   const { data } = await supabase.auth.getSession();
   ```

2. **Handle Initial Session if Present**
   - Set authentication state
   - Ensure profile exists
   - Load initial data (blocking operation OK here)

3. **Register onAuthStateChange Listener**
   - Sets up implicit flow callback
   - Detects all future auth changes
   - Defers data loading to avoid deadlock

### onAuthStateChange Callback - No Deadlock

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  // Only handle these events:
  if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
    // Check if session actually changed
    if (sessionChanged && !currentState._isLoadingData) {
      // Mark as loading to prevent duplicate loads
      set((state) => ({ 
        _isLoadingData: true,
        _currentSessionId: newSessionId,
      }));
      
      // Schedule data load asynchronously
      setTimeout(async () => {
        try {
          await get()._loadInitialData(uid);
        } finally {
          set((state) => ({ _isLoadingData: false }));
        }
      }, 0);
    }
  } else if (event === 'SIGNED_OUT') {
    // Clear everything
  } else if (event === 'TOKEN_REFRESHED') {
    // Just update session ID, don't reload data
  }
});
```

### Google OAuth Flow - Simplified

```typescript
// 1. Exchange Google ID token for Supabase session
const { data: sessionData } = await supabase.auth.signInWithIdToken({
  provider: 'google',
  token: idToken,
  nonce: rawNonce,
});

// 2. Upsert profile with Google metadata
const upsertPayload = { id: userId, name: googleName, avatar_url: googleAvatar };
await supabase.from('profiles').upsert(upsertPayload);

// 3. Track session ID only
set((state) => ({
  authError: null,
  _currentSessionId: session.access_token,
}));

// 4. ✅ STOP HERE - Do NOT call _loadInitialData
// The onAuthStateChange callback will be triggered automatically
// by Supabase after the session is established
```

## Why This Works

### Before (Race Condition)
```
signInWithIdToken() returns
├─ Manual set({isAuthenticated: true, id: userId})
├─ Manual _loadInitialData() starts
│  └─ Queries profiles, events, posts...
└─ Supabase triggers onAuthStateChange SIGNED_IN
   └─ onAuthStateChange calls _loadInitialData() AGAIN
      └─ Second load might complete first!
   └─ Duplicate data loads race against each other
```

### After (Proper Implicit Flow)
```
signInWithIdToken() returns
├─ Set _currentSessionId to track session
└─ Wait for Supabase to trigger onAuthStateChange

Supabase triggers onAuthStateChange SIGNED_IN
├─ Detect new session ID (not duplicate)
├─ Set _isLoadingData = true
└─ Schedule _loadInitialData asynchronously
   └─ Runs after callback completes (no deadlock)
   └─ Only one data load happens
   └─ Data loads before UI renders
```

## Testing the Fix

To verify data loads correctly on first Google OAuth:

1. **Before**: Data was missing until manual refresh
2. **After**: Timeline, posts, events all visible immediately after OAuth

Check console logs:
```
[initializeAuth] Initial session check: { hasSession: false }
[onAuthStateChange] Event: SIGNED_IN ...
[onAuthStateChange] Session detected, scheduling data load
[onAuthStateChange] Starting data load for session: uuid...
[_loadInitialData] Loaded: { users: 1, organizations: 5, events: 12, runPosts: 24 }
[onAuthStateChange] Data load complete
```

## Key Learnings

1. **Never use `await` inside `onAuthStateChange`** - Deadlock guaranteed
2. **Implicit flow means tokens are in URL fragment** - Supabase handles extraction
3. **Session tokens refresh automatically** - Don't use them for equality checks
4. **Use session ID comparison instead** - Check if tokens changed, not if they're equal
5. **Defer async work from callbacks** - Use `setTimeout` or Promises
6. **The `INITIAL_SESSION` event is special** - Check it only once at app startup

## References

- [Supabase Implicit Flow Docs](https://supabase.com/docs/guides/auth/sessions/implicit-flow)
- [Supabase onAuthStateChange API](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
- [Known Deadlock Issue](https://github.com/supabase/gotrue-js/issues/762)
- [Advanced Auth Guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide)




