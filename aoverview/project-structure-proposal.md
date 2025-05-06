# Revised Project Structure Proposal (v2 - Colocation)

This document outlines a simplified refactoring of the `poker-nights-next` project structure, adopting a **colocation** strategy for feature-specific components alongside the routes that use them. This enhances clarity, maintainability, and aligns with Next.js App Router best practices using shadcn/ui and Tailwind CSS.

## Goals

1.  **Clear Separation of Concerns**: Isolate Routing/Page Logic (`app/`), Global UI Components (`components/`), State Management (`hooks/`, `store/`, `providers/`), Utilities (`lib/`), and Configuration.
2.  **Simplified App Routing**: Structure routes logically based on application sections (Auth, Main Features).
3.  **Component Colocation**: Place components primarily used by a specific route within a `components/` subfolder next to that route's `page.tsx`. The `page.tsx` orchestrates these colocated components.
4.  **Keep Global Components Separate**: Maintain `components/layout/` and `components/ui/` for truly shared layout and UI primitives.
5.  **Reflect Current Stack**: Accurately represent the use of shadcn/ui, Tailwind CSS, and Framer Motion.

## Proposed Structure (Colocation Strategy)

```
poker-nights-next/
├── app/
│   ├── (auth)/                 # Auth-related routes
│   │   └── login/
│   │       ├── page.tsx        # Login page orchestrator
│   │       └── components/     # Components specific to login page (if any)
│   ├── (main)/                 # Main application routes (require auth, share layout)
│   │   ├── layout.tsx          # Main app layout (imports components/layout/AppLayout)
│   │   ├── new-game/           # Default feature: New Game Setup/Play/Settle
│   │   │   ├── page.tsx        # Orchestrates components below
│   │   │   └── components/     # *** Colocated components for the new-game feature ***
│   │   │       ├── GameSetup.tsx
│   │   │       ├── PokerTable.tsx
│   │   │       ├── GameTable.tsx
│   │   │       ├── GameSettlement.tsx
│   │   │       ├── CardDealer.tsx
│   │   │       └── PlayerCard.tsx  # Moved here, could be moved to ui later if reused
│   │   ├── past-games/         # Feature: View Past Games (Planned)
│   │   │   ├── page.tsx
│   │   │   └── components/     # Colocated components for past-games
│   │   └── performance/        # Feature: View Performance (Planned)
│   │       ├── page.tsx
│   │       └── components/     # Colocated components for performance
│   ├── api/                    # API Routes
│   │   └── ...
│   ├── layout.tsx              # Root layout (providers, base HTML structure)
│   └── globals.css             # Tailwind global styles
│   └── page.tsx                # Root page (landing/redirect)
├── components/                   # *** Global/Shared Reusable Components ***
│   ├── layout/                 # Components used in main layout files (Sidebar, Header)
│   │   └── AppLayout.tsx
│   │   └── ...
│   └── ui/                     # Generic, atomic UI elements (Button, Card, Input, Avatar, etc.)
│       └── avatar.tsx          # Generally managed by shadcn/ui CLI
│       └── button.tsx
│       └── ...
├── config/
│   └── firebase.ts
│   └── site.ts
├── constants/
│   └── index.ts
├── hooks/
│   └── useFirebaseAuth.ts
│   └── useGameFlow.ts
│   └── useGameData.ts
├── lib/
│   ├── firebase/
│   ├── gpt/
│   └── utils.ts
├── providers/
│   └── AuthProvider.tsx
│   └── GameProvider.tsx
├── public/
├── store/
│   └── gameStore.ts
├── types/
│   └── index.ts
│   └── game.ts
│   └── user.ts
├── .env.local
├── .eslintrc.json
├── .gitignore
├── components.json             # shadcn/ui configuration
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── aoverview/
│   └── ...
└── README.md
```

## Key Principles & Rationale

1.  **Route-Specific Components Live Nearby**: Components like `GameSetup.tsx` are unlikely to be used outside the `/new-game` flow, so placing them in `app/(main)/new-game/components/` makes sense.
2.  **`page.tsx` Orchestrates Colocated Components**: `app/(main)/new-game/page.tsx` imports directly from its `./components/` subdirectory (e.g., `import GameSetup from './components/GameSetup';`). It manages the state (like the current step of the game flow) and passes data/callbacks down.
3.  **Global Components Remain Separate**: Truly reusable UI elements (`components/ui/`) and layout structures (`components/layout/`) stay in the top-level `components` directory for clarity and easy access from anywhere.
4.  **Multi-Step Flow Handling**: This structure naturally supports multi-step flows within a single route. The `page.tsx` handles the state and logic for switching between steps, conditionally rendering the appropriate colocated component.
5.  **Refactoring Path**: If a component initially colocated (like `PlayerCard.tsx`) is later needed elsewhere, it can be refactored and moved to `components/ui/` and imports updated accordingly.

## Example Flow (`app/(main)/new-game/page.tsx`)

```tsx
'use client';

import { useState } from 'react';
import useGameFlow from '@/hooks/useGameFlow';
import useGameData from '@/hooks/useGameData';
// Imports from the colocated components directory
import GameSetup from './components/GameSetup';
import GameTable from './components/GameTable'; // Assuming GameTable covers 'play' phase
import GameSettlement from './components/GameSettlement';
import { Player } from '@/types'; // Assuming types are in @/types

export default function NewGamePage() {
  const { currentPhase, players, gameId, setPlayers, setPhase, startGame, settleGame } = useGameFlow();
  const { saveGame, loading } = useGameData();

  const handleGameSetup = (gameName: string, initialPlayers: Player[]) => {
    startGame(gameName, initialPlayers);
    // saveGame(...);
  };

  const handleAddPlayer = (newPlayer: Player) => { /* ... */ };
  const handleGoToSettle = () => setPhase('settlement');
  const handleSettleSubmit = (finalStacks: Record<string, number>) => {
    settleGame(finalStacks);
    // saveGame(...);
  };

  return (
    <div className="container mx-auto py-4">
      {/* Conditional rendering based on the state managed by useGameFlow */}
      {currentPhase === 'setup' && (
        <GameSetup onSubmit={handleGameSetup} />
      )}

      {currentPhase === 'play' && (
        <GameTable
          players={players}
          onAddPlayer={handleAddPlayer}
          onGoToSettle={handleGoToSettle}
        />
      )}

      {currentPhase === 'settlement' && (
        <GameSettlement
          players={players}
          onSettle={handleSettleSubmit}
        />
      )}

      {/* Add loading states etc. */}
    </div>
  );
}
```

This structure offers a good balance between organization and the practicality of keeping closely related code together.

## Next Steps

1.  **Approve this Colocation Strategy.**
2.  **Implement the File Moves:** Create `app/(main)/new-game/components/` and move relevant files from `components/game/` into it.
3.  **Address Missing Imports/Files:** Find/create `PlayerSpot.tsx` or fix the import in `PokerTable.tsx`.
4.  **Update All Import Paths:** Carefully review moved files and files importing them to ensure all paths are correct relative to their new locations. Use path aliases (`@/`) where possible.
5.  **Delete `components/game/`** after confirming everything works.
6.  Update `progress.md`. 