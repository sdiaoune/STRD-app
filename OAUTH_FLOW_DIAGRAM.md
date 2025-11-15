# Google OAuth Flow Diagrams

## Before Fix (❌ Broken with Race Conditions)

```
User taps "Continue with Google"
    |
    v
WebBrowser.openAuthSessionAsync()
    |
    +---> Browser shows Google consent screen
    |
    +---> User grants permission
    |
    v
Browser redirects to app://auth/callback#id_token=...
    |
    v
Supabase client (implicit flow) extracts tokens from URL fragment
    |
    v
signIn('google') called in sign-in.tsx
    |
    +---> Exchange id_token with signInWithIdToken()
    |
    +---> set({ isAuthenticated: true, id: userId })  ← Manual state update
    |
    +---> _loadInitialData(userId)  ← Manual data load
    |     ├─ Queries profiles
    |     ├─ Queries events
    |     └─ Queries run_posts
    |
    +---> (Meanwhile, Supabase triggers onAuthStateChange internally)
          |
          v
          onAuthStateChange(event='SIGNED_IN', session=...)  ← Async callback
          |
          +---> async (event, session) => {
          |       await _loadInitialData(uid)  ← ❌ DEADLOCK STARTS HERE
          |       // This await blocks Supabase client!
          |     }
          |
          └---> Second _loadInitialData() starts
                ├─ Queries profiles (again!)
                ├─ Queries events (again!)
                └─ Queries run_posts (again!)

RACE CONDITION:
├─ First load might complete before second
├─ Second load might complete first
└─ One load sees incomplete profile data → incomplete UI

DEADLOCK ISSUE:
├─ await inside callback blocks Supabase client
└─ App freezes until callback completes
```

## After Fix (✅ Working with Implicit Flow)

```
User taps "Continue with Google"
    |
    v
WebBrowser.openAuthSessionAsync()
    |
    +---> Browser shows Google consent screen
    |
    +---> User grants permission
    |
    v
Browser redirects to app://auth/callback#id_token=...
    |
    v
Supabase client (implicit flow) extracts tokens from URL fragment
    |
    v
signIn('google') called in sign-in.tsx
    |
    +---> Exchange id_token with signInWithIdToken()
    |
    +---> Upsert profile with Google metadata
    |
    +---> set({
    |       authError: null,
    |       _currentSessionId: session.access_token
    |     })  ← Only track session, don't load data
    |
    +---> return (function exits)  ← ✅ Quick exit, no data loading
          |
          v
          Supabase triggers onAuthStateChange internally
          |
          v
          onAuthStateChange(event='SIGNED_IN', session=...)  ← Sync callback
          |
          +---> const newSessionId = session.access_token
          |
          +---> const sessionChanged = (newSessionId !== _currentSessionId)
          |
          +---> if (sessionChanged && !_isLoadingData) {
          |       set({
          |         isAuthenticated: true,
          |         _currentSessionId: newSessionId,
          |         _isLoadingData: true
          |       })
          |
          +---> setTimeout(async () => {  ← ✅ Deferred, not awaited
          |       _loadInitialData(uid)
          |       └─ Queries profiles (once)
          |       └─ Queries events (once)
          |       └─ Queries run_posts (once)
          |     }, 0)
          |
          +---> return (callback exits)  ← ✅ Callback doesn't block
                |
                (Supabase client is ready for next call)
                |
                Event loop processes setTimeout
                |
                v
                async _loadInitialData() starts
                ├─ Profile query completes
                ├─ Events query completes
                ├─ Run posts query completes
                |
                v
                set() updates state with all data
                |
                v
                UI renders with complete data  ← ✅ First render has all data
```

## State Machine: Session Tracking

```
Initial State
├─ _currentSessionId: null
├─ _isLoadingData: false
└─ isAuthenticated: false

        ↓ User signs in with Google

Getting ID Token
├─ _currentSessionId: null (still)
└─ (awaiting signInWithIdToken)

        ↓ signInWithIdToken returns

Session Established
├─ _currentSessionId: "abc123..."  ← Set by signIn()
├─ _isLoadingData: false
└─ isAuthenticated: false (still)

        ↓ onAuthStateChange triggers

Detected New Session
├─ newSessionId = "abc123..."
├─ sessionChanged = true (null !== "abc123...")
├─ _isLoadingData: false
└─ Action: Schedule data load

Loading Data
├─ _currentSessionId: "abc123..."
├─ _isLoadingData: true  ← Flag set
├─ isAuthenticated: true  ← Updated
└─ (setTimeout scheduled)

Data Load In Progress
├─ Queries running...
├─ _isLoadingData: true  ← Still loading
└─ (Future onAuthStateChange events will skip loading)

Data Load Complete
├─ _currentSessionId: "abc123..."
├─ _isLoadingData: false  ← Loading done
├─ isAuthenticated: true
├─ users: [...]  ← Data loaded
├─ events: [...]
└─ runPosts: [...]

        ↓ Token auto-refreshes in 1 hour

Token Refreshed
├─ newSessionId = "def456..."  ← New token
├─ sessionChanged = true  (new token)
├─ _isLoadingData: false
└─ Action: Update session ID only

Token Updated
├─ _currentSessionId: "def456..."
├─ _isLoadingData: false
├─ isAuthenticated: true
└─ (data NOT reloaded)

        ↓ User signs out

Signed Out
├─ _currentSessionId: null  ← Reset
├─ _isLoadingData: false  ← Reset
└─ isAuthenticated: false  ← Reset
```

## Sequence Diagram: Authorization Events

```
User            Browser         OAuth          Supabase         App Store
 |                 |             Provider          JS
 |                 |               |                |              |
 +-->Click Google--+               |                |              |
 |                 |               |                |              |
 |                 +---Auth Request--->             |              |
 |                 |               |                |              |
 |                 |<--Consent--+   |                |              |
 |                 |   Screen   |   |                |              |
 |                 |            |   |                |              |
 |<--Show--+       |            |   |                |              |
 |Auth Form|       |            |   |                |              |
 |         |       |            |   |                |              |
 +--Grant--+       |            |   |                |              |
 |         |       |            |   |                |              |
 |         +---User Grant------>|   |                |              |
 |         |       |            |   |                |              |
 |         |<---Auth Code------+    |                |              |
 |         |       |            |   |                |              |
 |         +--Redirect URI------+   |                |              |
 |         | #id_token=xyz      |   |                |              |
 |         |       |            |   |                |              |
 |<--Return+       |            |   |                |              |
 |URL Frag |       |            |   |                |              |
 |         |       |            |   |                |              |
 |signIn('google')                  |                |              |
 +--------------------------------->|                |              |
 |         |       |            |   |                |              |
 |         |       |            |   |signInWithIdToken|              |
 |         |       |            |   +-------+        |              |
 |         |       |            |   |       |        |              |
 |         |       |            |   |<------+        |              |
 |         |       |            |   | Session OK     |              |
 |         |       |            |   |                |              |
 |         |       |            |   |Upsert Profile  |              |
 |         |       |            |   +-----+          |              |
 |         |       |            |   |     |          |              |
 |         |       |            |   |<----+          |              |
 |         |       |            |   |                |              |
 |Track SessionID              |                |              |
 +-----------+ Set _currentSessionId             |
 |         |       |            |   |                |              |
 | (return)                       |                |              |
 |<--------+       |            |   |                |              |
 |         |       |            |   |                |              |
 |         |       |            |   | [Internal]     |              |
 |         |       |            |   | onAuthStateChange             |
 |         |       |            |   |                +--Schedule--->|
 |         |       |            |   |                | _loadInitialData
 |         |       |            |   |                |              |
 |         |       |            |   |                | setTimeout(0)|
 |         |       |            |   |                |              |
 |         |       |            |   |                +--Event Loop--|
 |         |       |            |   |                |              |
 |         |       |            |   |                +--Load Users--|
 |         |       |            |   |<----------+    |              |
 |         |       |            |   |          |    |              |
 |         |       |            |   |                +--Load Events-|
 |         |       |            |   |<----------+    |              |
 |         |       |            |   |          |    |              |
 |         |       |            |   |                +--Load Posts--|
 |         |       |            |   |<----------+    |              |
 |         |       |            |   |          |    |              |
 |         |       |            |   |                +--Update State|
 |         |       |            |   |<----------+    |              |
 |         |       |            |   |                |              |
 |Render UI (✅ with all data)      |                |              |
 |<--------+       |            |   |                |              |

✅ Timeline has posts
✅ Events visible
✅ All data loaded
```

## Data Flow Comparison

### ❌ Before (Race Conditions)

```
signInWithIdToken()
    ↓
    ├→ set(isAuth=true)
    │
    ├→ _loadInitialData()  LOAD #1
    │  ├ get profiles
    │  ├ get events
    │  └ get posts
    │
    └→ onAuthStateChange fires
       └→ _loadInitialData()  LOAD #2  ← Race!
          ├ get profiles
          ├ get events
          └ get posts

Result: Unpredictable completion order
```

### ✅ After (Proper Flow)

```
signInWithIdToken()
    ↓
    └→ set(_currentSessionId)
       └→ return immediately

onAuthStateChange fires
    ↓
    ├→ detect session changed
    │
    └→ setTimeout(() => {
       └→ _loadInitialData()  LOAD #1 (only once)
          ├ get profiles
          ├ get events
          └ get posts

Result: Single guaranteed load, all data ready
```

## Key Differences

| Aspect | Before ❌ | After ✅ |
|--------|-----------|---------|
| **Callback Type** | `async (event, session)` | `(event, session)` |
| **Awaits in callback** | `await _loadInitialData()` | None |
| **Data loads** | 2+ simultaneous | 1 deferred |
| **Session detection** | Token comparison | Identity comparison |
| **Deadlock risk** | High (known bug) | None |
| **Data completeness** | Unreliable | Guaranteed |
| **Performance** | Multiple queries | Single query set |
| **UI consistency** | Flickering/blank | Stable |




