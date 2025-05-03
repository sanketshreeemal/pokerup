# 🃏 Poker Nights

A mobile-first, multi-user web application for tracking and settling poker game buy-ins and payouts.

## 🚀 Tech Stack

- **Frontend**: React + Next.js (App Router)
- **Styling**: Chakra UI
- **Authentication**: Firebase Auth (Google login)
- **Database**: Firebase Firestore
- **AI Integration**: GPT-4 for settlement calculations
- **Deployment**: Vercel

## 📁 Project Structure

```
poker-nights/
├── app/                    # Next.js app directory
│   ├── page.tsx            # Landing page / login screen
│   ├── app/                # Main application pages
│   │   ├── layout.tsx      # App layout with navigation tabs
│   │   ├── page.tsx        # Play Game page (default tab)
│   │   ├── games/          # Past Games tab
│   │   │   └── page.tsx    # Past Games list view
│   │   └── performance/    # Performance tab
│   │       └── page.tsx    # Performance stats (placeholder)
│   └── game/               # Public game view
│       └── [id]/           # Dynamic route for game details
│           └── page.tsx    # Public game details page
├── components/             # Reusable components
│   └── ui/                 # UI components
│       ├── AppLayout.tsx   # Main app layout with navigation
│       ├── GameForm.tsx    # Game creation form
│       ├── GameTable.tsx   # Game in-progress table
│       ├── SettlementBox.tsx # Settlement calculation & display
│       └── GameCard.tsx    # Game card for past games list
├── config/                 # Configuration files
│   └── firebase.ts         # Firebase configuration
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── models/                 # TypeScript interfaces
├── providers/              # Context providers
│   └── ChakraProvider.tsx  # Chakra UI provider setup
├── public/                 # Static assets
├── styles/                 # Global styles
├── types/                  # TypeScript type definitions
├── .env.local              # Environment variables
├── .eslintrc.json          # ESLint configuration
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── progress.md             # Progress tracking
└── README.md               # Project documentation
```

## 🗺️ Page and Component Overview

### Landing Page (`app/page.tsx`)
- **Description**: Welcome screen with Google sign-in button
- **Key Components**: 
  - Chakra UI `Box`, `Container`, `VStack`, `Heading`, `Button`
  - Background with a centered card layout
  - Mobile-responsive design with full-width button on small screens

### App Layout (`components/ui/AppLayout.tsx`)
- **Description**: Main application shell with header and navigation tabs
- **Key Components**:
  - Chakra UI `Tabs`, `TabList`, `Tab` for navigation
  - Responsive container layout
  - Header with app logo and user profile

### Play Game Page (`app/app/page.tsx`)
- **Description**: Main gameplay interface with three states (setup, playing, settlement)
- **Key Components**:
  - `GameForm`: Form to setup a new game with player management
  - `GameTable`: Table displaying player buy-ins, cash-outs, and balance
  - `SettlementBox`: Settlement calculation interface with instructions field
  - State management for game flow

### Past Games Page (`app/app/games/page.tsx`)
- **Description**: Grid display of past games with cards for each
- **Key Components**:
  - `GameCard`: Card with game image, title, date, player list, and view button
  - Responsive grid layout using Chakra UI `SimpleGrid`

### Game Details Page (`app/game/[id]/page.tsx`)
- **Description**: Public view of a game with all details and settlements
- **Key Components**:
  - Game metadata display with image and badges
  - Results table with player balances
  - Settlement instructions card

## 🛠️ Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Firebase and OpenAI credentials
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📝 Documentation

- [Progress Tracking](progress.md)

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details. 