## 1 Scope of this milestone

Give players a **safe‑to‑refresh** experience that covers:

1. Creating a poker game (doc only appears when the host hits **"Let's Play"**).
2. Joining or re‑buying while the game is live.
3. Live stack updates pushed to every participant.
4. Finishing the game and recording the final stacks ready for a settlement call.

### 2.1 Top‑level document

/games/{gameId}
name:            string
currency:        string            // e.g. 'CAD', 'USD'
status:          string            // 'active' | 'complete'
hostUsername:    string
createdAt:       timestamp (server)

playerUsernames array<string>     // [ 'alice', 'bob', ... ]
players:         map<username, PlayerStats>
settlement:      map?              // added on completion

PlayerStats {
buyInInitial:   number   // first buy‑in
addBuyIns:      number   // sum of all additional buy‑ins
cashOuts:       number   // sum of partial cash‑outs (chips → cash)
finalStack:     number?  // set only once game = complete
}

**3  State management**

| Layer | Purpose | Tool |
| --- | --- | --- |
| **Zustand store** | Holds the *current* game doc so UI feels instant. | `/src/store/game.ts` |
| **Firestore** | Single source of truth; survives refresh. | `onSnapshot` listener syncs → store |

Flow:
1. First page load subscribes to `games/{id}`.
2. Listener copies fresh data into Zustand.
3. All UI components read/write via the store; writes forward straight to Firestore.

**4  Backend function contracts** 

| Function name | Trigger & inputs | What it does | Output |
| --- | --- | --- | --- |
| **createGame** | Callable – fired when host clicks **"Let's Play"**.`{ name, currency, hostUsername, players }` | Adds new `/games/{id}` with `status:'active'` and initial players. | `{ gameId }` |
| **addPlayer** | Callable – from New‑Game page *after* game already active.`{ gameId, username, buyInInitial }` | Adds `username` to `players` map and `playerUsernames` array. | `{ ok:true }` |
| **rebuy** | Callable – in‑game button.`{ gameId, username, amount }` | Atomically increments `players.{username}.addBuyIns` **and** player's live stack. | `{ newStack }` |
| **cashOutPartial** | Callable – rare button.`{ gameId, username, amount }` | Increments `cashOuts`, decrements live stack. | `{ newStack }` |
| **completeGame** | Callable – host submits final stacks.`{ gameId, finalStacksMap }` | Sets `status:'complete'`, writes `finalStack` for each player. | `{ ok:true }` |
| **getSettlement** | Callable – immediately after `completeGame`.`{ gameId }` | Calls external API → writes `settlement` map into doc. | `{ settlement }` |

All functions run in @firebaseUtils.ts

New folder structure has been created to implement this flow. All new files and new pages are created - please check for where things need to fit in. 

## 7 Step‑by‑step implementation plan

#	What you do	Starter tips
1	✅ Create the zustand store (src/store/game.ts)	* Make an interface GameDoc that matches the data model.* create the store with state { doc:null, loading:true } and actions subscribe(gameId), clear().* Export a React hook useGame() for components.
2	✅ Hook Firestore listener inside subscribe	* Call onSnapshot(doc(db,'games',gameId)).* On first fire: set({ doc:snap.data(), loading:false }).* Return the unsubscribe so components can unmount cleanly.
3	✅ Write the createGame callable	* In /functions/src/games.ts add export const createGame = onCall(...).* Validate: name ≤ 40 chars, currency in allowed list, at least 1 player.* Add doc with status:'active', serverTimestamp, and initial players map.* Return { gameId }.
4	✅ Build /game/new page	* Use useFormState or plain useState inputs (game name, currency).* Optional inline table to add players before starting.* On "Let's Play": call createGame, then router.push('/game/'+id).
5	Build /game/[id] page	* On mount: useGameStore.subscribe(params.id).* Show spinner while loading true.* Render a <table> with the stacks, buy‑ins, cash‑outs.* Show "host‑only" controls by comparing hostUsername to the current user.
6	Wire the Re‑buy button	* Per player row, host clicks Re‑buy → modal asks amount (positive number).* Call rebuy callable → optimistic update: increment local stack before server returns.* On error, roll back state and toast the message.
7	Wire the Cash‑out button	* Similar modal; amount must be ≤ current stack.* Call cashOutPartial; optimistic subtract.* Update cashOuts sum in UI.
8	End‑Game & Settle flow	* Host clicks End Game → opens final‑stack form listing each player.* Submit → call completeGame then getSettlement.* After settlement arrives, set store doc to read‑only (disable Re‑buy etc.).* Optionally redirect to /game/[id]/settle sub‑page that shows payouts.