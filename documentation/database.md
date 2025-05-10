# Firebase Firestore Integration Documentation

This document outlines the current setup and usage of Firebase Firestore within the PokerUp application. Its purpose is to provide a clear understanding of how game data is persisted and managed, serving as a reference for future development and refactoring, especially towards a multi-user architecture.

## 1. Firebase Initialization

Firebase is initialized in the `src/lib/firebase/firebase.ts` file.

- **Configuration**: It loads the Firebase project configuration from environment variables (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, etc.). These variables must be correctly set up in your `.env.local` file for Firebase services to work.
- **Services Initialized**:
    - **Firebase App**: The core Firebase app instance is initialized using `initializeApp(firebaseConfig)`.
    - **Authentication**: `getAuth(app)` is called to get the Firebase Auth instance, exported as `auth`.
    - **Firestore**: `getFirestore(app)` is called to get the Firestore database instance, exported as `db`. This `db` instance is used for all Firestore operations.
    - **Storage**: `getStorage(app)` is called to get the Firebase Storage instance, exported as `storage`. (Currently not extensively used for core game data).

## 2. Firestore Utility Functions

A set of utility functions to interact with Firestore are defined in `src/lib/firebase/firebaseUtils.ts`. These functions abstract the direct Firebase SDK calls and are used by the application's state management logic.

-   **`setDocumentWithId(collectionName: string, id: string, data: any): Promise<void>`**
    -   **Purpose**: Creates a new document or overwrites an existing document with a specific, client-provided ID.
    -   **Firebase SDK**: Uses `setDoc(doc(db, collectionName, id), data)`.
    -   **Usage**: Used for creating new game documents where the game ID is generated on the client (e.g., using `uuidv4`).

-   **`updateDocumentFields(collectionName: string, id: string, data: Partial<any>): Promise<void>`**
    -   **Purpose**: Updates specific fields of an existing document without overwriting the entire document.
    -   **Firebase SDK**: Uses `updateDoc(doc(db, collectionName, id), data)`.
    -   **Usage**: Used for all modifications to an existing game document, such as updating the player list, changing the game name, or adding settlement details.

-   **`getCollection(collectionName: string): Promise<DocumentData[]>`**
    -   **Purpose**: Retrieves all documents from a specified collection.
    -   **Firebase SDK**: Uses `getDocs(collection(db, collectionName))`.
    -   **Usage**: Can be used to list all games, though not currently implemented in the main game flow for selecting existing games (future feature).

-   **`getDocument(collectionName: string, id: string): Promise<DocumentData | null>`**
    -   **Purpose**: Retrieves a single document by its ID from a collection.
    -   **Firebase SDK**: Uses `getDoc(doc(db, collectionName, id))`.
    -   **Usage**: Can be used to fetch a specific game if its ID is known (future feature).

-   **`deleteDocumentPermanently(collectionName: string, id: string): Promise<void>`**
    -   **Purpose**: Deletes a document from a collection.
    -   **Firebase SDK**: Uses `deleteDoc(doc(db, collectionName, id))`.
    -   **Usage**: Not currently used in the main application flow but available for future game management features.

## 3. Data Models (`src/types.d.ts`)

The structure of the data stored in Firestore is defined by the TypeScript types in `src/types.d.ts`.

-   **`Player`**:
    -   `id`: string (client-generated `uuidv4`)
    -   `name`: string
    -   `initialBuyIn`: number
    -   `additionalBuyIns`: Array of `{ amount: number; timestamp: number }`
    -   `buyOuts`: Array of `{ amount: number; timestamp: number }`
    -   `totalBuyIn`: number (computed sum of initial and additional buy-ins, minus buy-outs)

-   **`Settlement`**:
    -   `instructions`: string (user-provided notes for settlement)
    -   `transfers`: Array of `{ from: string (Player ID); to: string (Player ID); amount: number }` (placeholder, AI calculation pending)
    -   `timestamp`: number (JavaScript timestamp, e.g., `Date.now()`)
    -   `finalPlayerStacks` (optional): Array of `{ playerId: string; finalStack: number; }` (stores each player's chip count at settlement)

-   **`Game`**:
    -   `id`: string (client-generated `uuidv4`, used as Firestore document ID)
    -   `name`: string
    -   `date`: `Date` object (Firestore typically stores this as a Timestamp)
    -   `players`: Array of `Player` objects
    -   `state`: `'setup' | 'playing' | 'settlement'` (current phase of the game)
    -   `settlement` (optional): `Settlement` object (added when the game is settled)

## 4. Zustand Store Integration (`src/app/context-mgmt/gameStore.ts`)

The Zustand store (`useGameStore`) acts as the central hub for managing game state and orchestrating Firestore operations. Components interact with the store's actions, which in turn call the Firebase utility functions.

-   **`setCurrentGame(gameSetupData)`**:
    -   Generates a `newGame` object, including a client-side `uuidv4` for `newGame.id`.
    -   Calls `setDocumentWithId('games', newGame.id, newGame)` to create the game document in Firestore using the client-generated ID.
    -   Updates the local Zustand state with this new game.

-   **`addPlayer(playerData)`**:
    -   If a `currentGame` exists, creates a new `Player` object with a `uuidv4`.
    -   Appends the new player to the `currentGame.players` array.
    -   Calls `updateDocumentFields('games', currentGame.id, { players: updatedPlayersList })` to update Firestore.

-   **`updatePlayer(updatedCompletePlayer)`**:
    -   If a `currentGame` exists, replaces the player in `currentGame.players` with `updatedCompletePlayer`.
    -   Calls `updateDocumentFields('games', currentGame.id, { players: newPlayersList })`. This is typically triggered by interactions in `PlayerCard.tsx` (e.g., buy-in, buy-out).

-   **`setPlayers(players)`**:
    -   If a `currentGame` exists, replaces the entire `currentGame.players` array with the provided `players` list.
    -   Calls `updateDocumentFields('games', currentGame.id, { players: validatedPlayersList })`. Used when adding multiple players to an existing game via `GameSetup.tsx`.

-   **`removePlayer(playerId)`**:
    -   Filters out the player from `currentGame.players`.
    -   Calls `updateDocumentFields('games', currentGame.id, { players: updatedPlayersList })`.

-   **`updateGameName(newName)`**:
    -   Updates the `name` field of the `currentGame`.
    -   Calls `updateDocumentFields('games', currentGame.id, { name: newName })`.

-   **`saveSettlement(settlementData)`**:
    -   If a `currentGame` exists, constructs an update object containing the `settlementData` and sets `state: 'settlement'`.
    -   Calls `updateDocumentFields('games', currentGame.id, gameUpdates)`. This is triggered from `page.tsx` after the settlement details are confirmed in `GameSettlement.tsx`.

## 5. Firestore Data Structure

Currently, the application uses a single top-level collection:

-   **`games` Collection**:
    -   Each document in this collection represents a single poker game.
    -   **Document ID**: A `uuidv4` string, generated on the client-side by `gameStore.ts` when a new game is created (via `setCurrentGame`). This ID is explicitly passed to `setDocumentWithId`.
    -   **Document Fields**: The fields of each document directly map to the `Game` type defined in `src/types.d.ts`.
        -   `id`: string (same as the document ID)
        -   `name`: string
        -   `date`: Firestore Timestamp (Firebase automatically converts JavaScript `Date` objects to its Timestamp format upon saving)
        -   `players`: An array of `Player` objects. Each player object within this array has its own `id` (also a `uuidv4`), name, buy-in details, etc.
        -   `state`: string (e.g., "playing", "settlement")
        -   `settlement`: (Optional) An object matching the `Settlement` type. This field is added/updated when a game is settled. It includes:
            -   `instructions`: string
            -   `transfers`: Array
            -   `timestamp`: number
            -   `finalPlayerStacks`: Array of `{ playerId: string, finalStack: number }`

    **Example Document in `games` collection (`/games/{gameId}`):**
    ```json
    {
      "id": "client-generated-uuid-for-game",
      "name": "Saturday Night Poker",
      "date": "Firestore Timestamp (e.g., October 26, 2023 at 10:00:00 PM UTC+0)",
      "players": [
        {
          "id": "client-generated-uuid-for-player1",
          "name": "Alice",
          "initialBuyIn": 100,
          "additionalBuyIns": [],
          "buyOuts": [],
          "totalBuyIn": 100
        },
        {
          "id": "client-generated-uuid-for-player2",
          "name": "Bob",
          "initialBuyIn": 100,
          "additionalBuyIns": [{ "amount": 50, "timestamp": 1678886400000 }],
          "buyOuts": [],
          "totalBuyIn": 150
        }
      ],
      "state": "playing",
      "settlement": null // or populated if the game is settled
    }
    ```

## 6. Key Data Interaction Flows

1.  **Creating a New Game**:
    -   User fills details in `GameSetup.tsx` and submits.
    -   `page.tsx`'s `handleStartGame` function is called.
    -   `handleStartGame` calls `store.setCurrentGame({ name, players })`.
    -   `store.setCurrentGame` generates a game ID, creates a `Game` object, and calls `setDocumentWithId('games', game.id, gameData)`.

2.  **Updating a Player (e.g., Buy-in/Buy-out)**:
    -   User interacts with `PlayerCard.tsx` (e.g., adds a buy-in).
    -   `PlayerCard.tsx` (ideally) calculates the updated player object.
    -   `PlayerCard.tsx` calls `store.updatePlayer(updatedPlayerObject)` (this might be routed via `page.tsx`'s `handleUpdatePlayer` depending on current prop drilling).
    -   `store.updatePlayer` finds the player in the `currentGame.players` array, updates it, and then calls `updateDocumentFields` to save the entire modified `players` array to the game document in Firestore.

3.  **Adding Players to an Existing Game**:
    -   From `GameTable.tsx`, user clicks "Add Player".
    -   `page.tsx`'s `handleAddPlayerMode` sets UI state to show `GameSetup.tsx` in "add players" mode, passing the `currentGame` as `existingGame`.
    -   User adds new player details in `GameSetup.tsx` and submits.
    -   `page.tsx`'s `handleStartGame` (in its `isAddingPlayersMode` branch) is called with the full list of players (existing + new).
    -   `handleStartGame` calls `store.setPlayers(fullPlayerList)`.
    -   `store.setPlayers` updates the `players` array in the current game document in Firestore.

4.  **Saving Game Settlement**:
    -   In `GameTable.tsx`, user clicks "Settle Up", inputs final stack amounts for players.
    -   Clicks "Continue to Settlement". `GameTable.tsx` calls `page.tsx`'s `handleRequestSettlement(finalStacks)`.
    -   `page.tsx` stores `finalStacks` and transitions to `GameSettlement.tsx`.
    -   User adds instructions in `GameSettlement.tsx` and finalizes.
    -   `GameSettlement.tsx` calls `page.tsx`'s `handleCompleteSettlement(settlementDetails)`.
    -   `handleCompleteSettlement` augments `settlementDetails` with `finalPlayerStacks` and calls `store.saveSettlement(fullSettlementData)`.
    -   `store.saveSettlement` calls `updateDocumentFields` to add the `settlement` object to the game document and update its `state` to 'settlement'.

## 7. IDs and Uniqueness

-   **Game IDs**: Generated client-side using `uuidv4()` within `gameStore.ts` during the `setCurrentGame` action. This ID is used as the Firestore document ID for the game.
-   **Player IDs**: Also generated client-side using `uuidv4()` either in `GameSetup.tsx` when initially creating players, or in `gameStore.ts` when adding a player or ensuring players passed to `setPlayers` have IDs. These IDs are unique within the scope of a game's `players` array.

## 8. Future Considerations for Multi-User Architecture

The current setup is primarily designed for a single-user or local experience. Transitioning to a robust multi-player application will require significant changes, including:

-   **User Authentication**: Integrate Firebase Authentication to manage user accounts.
-   **User Profiles**: A `users` collection to store user-specific information.
-   **Data Ownership & Permissions**:
    -   Games might need to be linked to a "host" user or a list of participant user IDs.
    -   Firestore Security Rules will need to be much more granular to control read/write access based on authenticated user IDs and game membership.
-   **Real-time Updates**: For multiple users to see changes live (e.g., other players' buy-ins), Firestore's real-time listeners (`onSnapshot`) will be necessary instead of one-time fetches or store-driven updates alone.
-   **Data Structures**:
    -   Consider how games are queried (e.g., "show me all games I'm a part of"). This might involve denormalizing some data or using array-contains queries.
    -   Player data within a game might still be an array, but linking these player entries to top-level user profiles will be key.
-   **Invitations/Joining Games**: A system for users to invite others or join existing games.

This documentation should provide a solid foundation for understanding the current state and planning these future enhancements.
