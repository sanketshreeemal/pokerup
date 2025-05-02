# Poker Settlement App — Frontend Specification

This document details the **frontend user flow**, **UI/UX design**, **component breakdown**, and implementation details using **React + Next.js**, **Chakra UI**, **Tailwind CSS**, and **TypeScript**. It supplements the overall PRD and backend docs, focusing solely on frontend concerns.

---

## 🎬 User Flow

1. **Landing (`/`)**
   - If _not authenticated_, show welcome screen with **Google Sign-In** button.
   - If _authenticated_, redirect to **Dashboard** (`/app`).

2. **Dashboard (`/app`)**
   - **Navigation Tabs** (Chakra `Tabs`):
     - **Play a Game** (default)
     - **Past Games**
     - **Performance** (future)

3. **Play a Game**
   - **Game Setup**
     - Form inputs: Game Name, Game Photo
     - Player list initializer (3 rows)
     - Add Player button
     - **"Start Game"** button
   - **In-Game View**
     - Real-time player table:
       - Name, Total Buy-Ins, Cash-Outs, Final Stack input
       - Buttons: **Add Buy-In**, **Cash-Out**
     - **Persist** state automatically to Firestore
   - **Settle Up**
     - Textarea for instructions
     - **Settle Up** button → triggers GPT cloud function
     - Displays settlement results list
     - **Copy Public URL** button

4. **Past Games (`/app/games`)**
   - Grid of game cards:
     - Thumbnail (selfie), Game Name, Date, Status
     - **View** button opens public view (`/game/[id]?view=public`)

5. **Game Detail (Public) (`/game/[id]`)**
   - Read-only summary of:
     - Game metadata, Player list, Buy-ins, Cash-outs
     - Settlement results
     - Game photo

6. **Performance (`/app/performance`)** – Placeholder for stats

---

## 🖼 UI & UX Design

### 🎨 Styling
- **Chakra UI** for base components and theming
- **Tailwind CSS** for utility classes when fine-grained control is needed
- **CSS Module** allowed for custom styles if necessary

### 📐 Layout & Responsiveness
- **Mobile-first**: Use Chakra’s `useBreakpointValue` & Tailwind responsive classes (e.g. `sm:`, `md:`, `lg:`)
- **Flex & Grid** via Chakra (`Flex`, `Grid`) for structure
- **Spacing**: Chakra theme spacing keys (`p={4}`, `m={2}`) and Tailwind `space-y-4`

### ⚡ Interactions
- **Buttons**: Chakra `Button` with `variant="solid" | "outline"`
- **Forms**: `FormControl`, `FormLabel`, `Input`, `NumberInput`
- **Modals**: Chakra `Modal` for buy-in and cash-out dialogs
- **Toasts**: Chakra `useToast` for success/error feedback
- **Loading**: Chakra `Spinner` overlay for async operations

### 🧩 Component Library Usage
- **Tabs** (`Tabs`, `TabList`, `TabPanels`, `TabPanel`)
- **Inputs** (`Input`, `NumberInput`, `Textarea`)
- **Navigation** (`Link`, `NextLink` for routes)
- **Avatar** for user profile & game selfie placeholder
- **Icons**: Use `react-icons` or Chakra’s built-in icons

---

## 🏗 Component Breakdown

```plaintext
/components
  ├─ Layout.tsx           # App shell: header, nav tabs, footer
  ├─ GameForm.tsx         # Game setup form
  ├─ PlayerRow.tsx        # Single player entry row
  ├─ GameTable.tsx        # In-game state table
  ├─ SettlementBox.tsx    # Settlement input & output
  ├─ GamesGrid.tsx        # Past games grid
  ├─ GameCard.tsx         # Single game card
  ├─ PublicGameView.tsx   # Read-only game summary
  ├─ PerformancePanel.tsx # Placeholder analytics
/utils
  └─ formValidators.ts    # Zod schemas for form validation
/lib
  └─ prompts.ts           # GPT prompt builder
/pages
  ├─ index.tsx            # Landing / login
  ├─ app
  │   ├─ page.tsx         # Dashboard wrapper
  │   ├─ games
  │   │   └─ page.tsx     # Past games
  │   └─ performance
  │       └─ page.tsx     # Performance
  ├─ game
  │   └─ [id].tsx         # Public game view
  └─ api
      ├─ auth.ts          # NextAuth or Firebase Auth endpoints
      ├─ settle.ts        # Settlement cloud function proxy
      └─ games.ts         # CRUD game endpoints
```

---

## 🔄 State Management
- **React Context** (`GameContext`) for current game session
- **SWR** or **React Query** for fetching past games and performance data
- **Local state** within components for form inputs

---

## 🔗 Integration Points & TODOs

1. **Firebase Setup**
   - Initialize in `/lib/firebase.ts`
   - Expose `auth`, `firestore`, `storage`
2. **Auth Guard**
   - Higher-order component or middleware to protect `/app` routes
3. **Form Validation**
   - Use Zod in `formValidators.ts` to validate game and player inputs
4. **API Integration**
   - **`/api/settle.ts`**: proxy to Firebase Cloud Function calling GPT-4 mini
   - **CRUD** calls in `utils/api.ts`
5. **Responsive Testing**
   - Validate UI on mobile, tablet, desktop using Chrome DevTools
6. **Accessibility**
   - Ensure `aria-label` on buttons
   - Check focus order and keyboard navigation

---

## 📅 Next Steps

- Review design with stakeholders
- Mockup key screens in Figma or similar
- Begin scaffolding Next.js project
- Implement Layout and Auth flows

