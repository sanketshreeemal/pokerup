# 🃏 Poker App — Product Requirements Document (PRD)

## 🧭 Purpose
To create a mobile-first, multi-user web application for tracking and settling poker game buy-ins and payouts. Users can log games, add players, record buy-ins and cash-outs, calculate settlement splits using a GPT-based model, and view historical performance over time. The app should be secure, lightweight, and social—with public shareable receipts.

---

## ⚙️ Tech Stack

### Frontend
- **Framework**: React + Next.js (App Router)
- **Styling/UI**: Chakra UI (component library)
- **Authentication**: Firebase Auth (Google login)
- **State Management**: React Context or Zustand

### Backend
- **Database**: Firebase Firestore (NoSQL, cloud-hosted)
- **Auth**: Firebase Authentication (Google sign-in)
- **API Integration**: GPT-4o (or GPT-4 mini) via OpenAI API for settlement logic

### Dev Tools
- **Hosting**: Vercel
- **Version Control**: GitHub
- **Environment Management**: .env.local

---

## 🖼️ Frontend Architecture & UI Flow

### 🛬 Landing Page
- Simple welcome screen
- CTA: “Log In with Google” (Firebase Auth)

### 🔐 Auth Flow
- Google Sign-In only
- After login, user is redirected to `/home`

### 🏠 Home Page Tabs
- **Navigation Tabs (Chakra Tab Components)**
  - Play a Game
  - View Past Games
  - (Future) Performance

---

## 🎮 Play a Game Tab

### Game Creation Form
- Game Name (default: today’s date)
- Add a Game Photo (selfie, optional)
- Initial 3 player input fields: Name, Buy-in
- “+ Add Player” button (append more rows dynamically)
- Each player row has:
  - Text input: `Player Name`
  - Numeric input: `Buy-In`
  - “+ Add Buy-in” button (opens another numeric field for additional buy-ins)
  - “Cash Out” button (optional): logs any partial withdrawal

### Start Game Button
- Submits initial game state to Firestore
- Triggers write to `/users/{uid}/games/{gameId}`

### Game In Progress View
- Displays current game state:
  - Table of players, their buy-ins, add-ons, and current pot
  - Buttons to update buy-in or cash out
- **Persisted state**: auto-saved to Firebase so users can reload/resume later

### Settle Game
- User clicks “Settle Up”
- TextArea input for notes (e.g. final chip counts or who won/lost what)
- Backend calls GPT-4 mini with prompt to calculate settlement
- Display result like:
  ```
  John → Jane: $34
  Alex → Jane: $12
  ```
- Display copyable **Public URL**: `/game/{gameId}` — view-only summary

---

## 📁 Past Games Tab
- List view (cards or rows):
  - Game Name, Date, Player Count, Total Pot
  - Shareable “Receipt” link (view-only)

### Game Receipt View `/game/{gameId}`
- Public view (auth not required)
- View of players, buy-ins, cash-outs, game photo, final settlements
- Read-only, hosted statically

---

## 🔍 Performance Tab (Later Phase)
- Table of player names with:
  - # of games played
  - Total buy-ins
  - Net winnings/losses
- Interactive charts for trends (Chakra + Chart.js or Recharts)

---

## 🔐 Auth
- Firebase Authentication
- Only authenticated users can create/update games
- Public game pages are view-only

---

## 🔧 Placeholder Backend Logic
- Add/Update/Delete Game
- Add/Update Player Buy-in
- Trigger Settle Up with GPT prompt
- Public Game Summary Endpoint

---

## 🔌 Chakra UI Components Used
```bash
npm i @chakra-ui/react @emotion/react @emotion/styled framer-motion
```
- Tabs, Input, NumberInput, Textarea
- Button, Box, Flex, Avatar, Heading

---

## 📄 Firestore Schema (Simplified JSON)
```json
/users/{uid}:
  displayName: "Sanket"
  email: "sanket@gmail.com"
  createdAt: Timestamp
  games: {
    {gameId}: {
      name: "Poker Night - Apr 30",
      photoURL: "https://...",
      createdAt: Timestamp,
      settledAt: Timestamp,
      publicURL: "/game/abc123",
      players: {
        JohnDoe: {
          name: "John",
          buyIns: [50, 20],
          cashOuts: [30],
          finalStack: 40
        }
      },
      settlementResult: [
        "John → Jane: $34",
        "Alex → Jane: $12"
      ]
    }
  }
```

---

## 🗂 Folder Structure
```
/app
  /home
  /game/[gameId]
  /api
  /components
    GameForm.tsx
    PlayerCard.tsx
    NavigationTabs.tsx
    SettlePrompt.tsx
/lib
  firebase.ts
/public
  /uploads
/utils
  gptPromptBuilder.ts
```

---

## 🚧 Phase 1: Build Plan

### Step 1: Project Setup
- [ ] Init Next.js with Chakra UI
- [ ] Connect Firebase Auth (Google sign-in only)
- [ ] Setup Firestore connection

### Step 2: Frontend UI
- [ ] Build landing page and auth redirect
- [ ] Implement tabbed navigation (Play / Past Games)
- [ ] Build dynamic GameForm UI
- [ ] Hook up buy-in and player update logic

### Step 3: Backend Hooks
- [ ] Write functions for Firestore CRUD (games, players)
- [ ] Build settle-up handler with GPT-4o API call
- [ ] Expose public route for static game viewing

### Step 4: QA and Polish
- [ ] Add public view URL to game screen
- [ ] Mobile testing and layout fixes
- [ ] Deploy to Vercel

---


# Poker Nights - Progress Tracking

## 🚀 Project Status
**Current Phase**: Initial Setup

## ✅ Completed Items
- Project documentation created
- Initial project structure defined

## 📋 Pending Tasks

### 1. Project Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Chakra UI
- [ ] Configure Firebase
- [ ] Set up environment variables
- [ ] Configure ESLint and Prettier
- [ ] Set up Git repository

### 2. Authentication
- [ ] Implement Firebase Authentication
- [ ] Create Google Sign-in flow
- [ ] Set up protected routes
- [ ] Create auth context/provider

### 3. Core Features
- [ ] Landing page
- [ ] Home page with navigation tabs
- [ ] Game creation form
- [ ] Player management system
- [ ] Buy-in tracking
- [ ] Game settlement system
- [ ] GPT integration for settlements
- [ ] Public game view

### 4. Database
- [ ] Set up Firestore collections
- [ ] Create data models
- [ ] Implement CRUD operations
- [ ] Set up real-time listeners

### 5. UI Components
- [ ] Navigation tabs
- [ ] Game form
- [ ] Player cards
- [ ] Settlement display
- [ ] Public game view
- [ ] Loading states
- [ ] Error handling

### 6. Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing

### 7. Deployment
- [ ] Set up Vercel deployment
- [ ] Configure production environment
- [ ] Set up CI/CD pipeline
- [ ] Performance optimization

## 📅 Timeline
- Phase 1 (Setup): TBD
- Phase 2 (Core Features): TBD
- Phase 3 (Testing & Polish): TBD
- Phase 4 (Deployment): TBD

## 📝 Notes
- Project started on [Current Date]
- Following Next.js 13+ App Router best practices
- Using TypeScript for type safety
- Implementing Chakra UI for consistent design
- Firebase for backend and authentication 