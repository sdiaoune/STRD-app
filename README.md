# STRD - Social Running & Wellness App

STRD (pronounced "Stride") is a social running and wellness mobile app built with Expo, React Native, and TypeScript. The app allows users to discover nearby running events, track their runs, and share their fitness journey with the community.

## Features

- **Events Discovery**: Browse nearby running and wellness events with filtering options
- **Run Tracking**: Simulated GPS tracking with live metrics (timer, distance, pace)
- **Social Timeline**: Mixed feed of run posts and events with lightning bolt likes
- **User Profiles**: View stats, recent posts, and personal achievements
- **Organization Profiles**: Partner and community organization pages
- **Interactive Posts**: Like, comment, and engage with run posts

## Tech Stack

- **Frontend**: Expo + React Native + TypeScript
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **State Management**: Zustand
- **Styling**: StyleSheet (no NativeWind)
- **Icons**: @expo/vector-icons
- **Data**: Local mock data (no backend)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Expo Go app on your mobile device

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Scan the QR code with Expo Go app on your mobile device

## App Structure

```
my-app/
├── App.tsx                 # Main app entry point
├── theme/
│   └── index.ts           # Design system (colors, spacing, typography)
├── data/
│   └── mock.ts            # Mock data and types
├── state/
│   └── store.ts           # Zustand store and actions
├── utils/
│   └── format.ts          # Utility functions for formatting
├── components/            # Reusable UI components
│   ├── Avatar.tsx
│   ├── EventCard.tsx
│   ├── RunPostCard.tsx
│   ├── SegmentedControl.tsx
│   ├── LikeButton.tsx
│   ├── TagPill.tsx
│   ├── StatsRow.tsx
│   └── EmptyState.tsx
└── screens/               # App screens
    ├── EventsScreen.tsx
    ├── EventDetailsScreen.tsx
    ├── TimelineScreen.tsx
    ├── PostDetailsScreen.tsx
    ├── RunScreen.tsx
    ├── ProfileScreen.tsx
    └── BusinessProfileScreen.tsx
```

## Navigation

The app uses a bottom tab navigation with four main sections:

1. **Events**: Browse and filter running events
2. **Timeline**: Social feed with run posts and events
3. **Run**: Track runs and post results
4. **Profile**: User profile and stats

Each tab can push to detail screens using native stack navigation.

## Mock Data

The app includes comprehensive mock data:
- 8 users (including current user)
- 8 organizations (3 partners, 5 community)
- 12 events over the next 14 days
- 14 run posts with varied metrics
- Timeline items mixing runs and events

## Key Features

### Run Tracking
- Simulated GPS metrics with realistic pace variations
- Live timer and distance tracking
- Route preview placeholder
- Post-run summary and sharing

### Social Features
- Lightning bolt (⚡) likes instead of hearts
- Comment system on run posts
- Mixed timeline of runs and events
- User and organization profiles

### Run Visibility
- Pick who can see each run (Public, Followers, Private) before posting
- Visibility badges on your posts make it obvious when a run is limited to followers or just you

### Event Discovery
- "For You" and "All" filtering
- Event details with organization info
- Partner badges for official organizations
- Distance and time information

## Notes

- **Simulated GPS**: All run tracking is simulated for demo purposes
- **No Backend**: All data is local mock data
- **Expo Go Compatible**: Works with Expo Go without native dependencies
- **Partner Badges**: Organizations with type "partner" show special badges

## Development

The app is built with modern React Native practices:
- TypeScript for type safety
- Zustand for lightweight state management
- Consistent design system with theme file
- Reusable components with proper props
- Clean navigation structure

## Contributing

- **Theme linting**: run `yarn lint:colors` (or `yarn lint:ci`) to ensure no hard-coded colors slip into `screens/`, `components/`, or `app/`.
- **Snapshots**: update `__tests__/ui.snap.test.tsx` snapshots after UI changes with `yarn test __tests__/ui.snap.test.tsx --updateSnapshot`.
- **Manual QA**: open `ComponentGallery` inside the app and flip the Light/Dark segmented control at the top to visually confirm new components respect tokens in both schemes.
- **Docs**: keep `docs/ui-theming.md` in sync when adding new primitives or tokens.

## License

This project is for demonstration purposes.
