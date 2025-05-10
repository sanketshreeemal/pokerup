# 🃏 Poker Nights

A mobile-first, multi-user web application for tracking and settling poker game buy-ins and payouts, built with a modern UI.

## 🚀 Tech Stack

- **Frontend**: React + Next.js (App Router)
- **Styling**: shadcn/ui & Tailwind CSS
- **Animation**: Framer Motion
- **Authentication**: Firebase Auth (Google login - Planned)
- **Database**: Firebase Firestore (Planned)
- **AI Integration**: GPT-4 for settlement calculations (Planned)
- **Deployment**: Vercel (Planned)

## 📁 Current Project Structure (Pre-Refactor)

```
poker-nights/
├── app/                      # Next.js app directory
│   ├── layout.tsx            # Root layout (providers)
│   └── page.tsx              # Main application page (currently game setup/play)
│   └── globals.css           # Tailwind global styles
├── components/
│   ├── auth/                 # Auth components (placeholder)
│   ├── layout/               # Layout components (Sidebar, Header)
│   │   └── AppLayout.tsx     # Main app layout with sidebar/header
│   ├── sections/             # Major page sections/features
│   │   ├── GameSetup.tsx     # Initial game setup form
│   │   ├── GameTable.tsx     # In-progress game view with player cards
│   │   └── GameSettlement.tsx # Settlement calculation UI
│   ├── ui/                   # shadcn/ui base components (Button, Input, Card etc.)
│   └── visuals/              # Visual elements (PokerTable, Chips, Cards)
├── config/                   # Configuration files
│   └── firebase.ts           # Firebase configuration (basic setup)
├── hooks/                    # Custom React hooks (e.g., useGameLogic)
├── lib/                      # Utility functions (utils.ts)
├── providers/                # Context providers (placeholder for Auth, Game state)
├── public/                   # Static assets
├── store/                    # Game state management (e.g., Zustand)
├── types/                    # TypeScript type definitions
├── .env.local                # Environment variables
├── .eslintrc.json            # ESLint configuration
├── components.json           # shadcn/ui configuration
├── next.config.js            # Next.js configuration
├── package.json              # Project dependencies
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── aoverview/                # Project documentation & planning
│   ├── progress.md
│   ├── README.md
│   └── ...
└── README.md                 # This file (needs update)
```
*Note: This reflects the structure before the proposed refactor. See `aoverview/project-structure-proposal.md` for the target structure.* 

## 🗺️ Core Feature: Game Flow

The primary user flow revolves around creating, playing, and settling a poker game.

### App Layout (`components/layout/AppLayout.tsx`)
- **Description**: Main application shell with a collapsible sidebar for navigation (planned: New Game, Past Games, Performance) and a header.
- **Key Components**: shadcn/ui components for layout, icons, buttons.

### Game Setup (`components/sections/GameSetup.tsx`)
- **Description**: Initial screen to set up a new game: define players and initial buy-ins.
- **Key Components**: shadcn `Input`, `Button`, `Card`. Interactive poker table visualization (`components/visuals/PokerTable.tsx`).

### Game Play (`components/sections/GameTable.tsx`)
- **Description**: Displays the active game. Shows player cards with names, buy-ins, and current status. Allows adding players mid-game.
- **Key Components**: shadcn `Card`, `ScrollArea`. Player cards (`components/ui/PlayerCard.tsx` - needs verification). Animated elements.

### Game Settlement (`components/sections/GameSettlement.tsx`)
- **Description**: Interface to input final chip counts for each player to calculate payouts.
- **Key Components**: shadcn `Input`, `Button`, `Table` (or similar for display).

*(Note: Past Games and Performance sections are planned features but not implemented yet).* 

## 🛠️ Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file (Firebase/OpenAI credentials needed for future features)
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📝 Documentation

- [Progress Tracking](./aoverview/progress.md)
- [Project Structure Proposal](./aoverview/project-structure-proposal.md)

## 🤝 Contributing

(Placeholder - Define contribution guidelines later)

## 📄 License

MIT License. 