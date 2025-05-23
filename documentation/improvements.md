# Improvements

# Application Improvement Log

This document tracks planned and completed improvements for the application. Improvements are organized by functional area (e.g., specific pages or modules) and then by priority within each area.

## Legend

* **[High]**: Critical improvements that should be addressed as soon as possible. These might be related to bugs, performance bottlenecks, or significant usability issues.
* **[Medium]**: Important improvements that enhance functionality or user experience but are not critical for immediate operation.
* **[Low]**: Minor enhancements, UI tweaks, or refactoring tasks that can be addressed when resources allow.
* **(Done)**: Indicates that the improvement has been implemented and deployed.

---

## Page 1: Lobby Page

### High

N/A

### Medium

* **Implement: Avatar selection in set-username dialog** - *Reason: The set-username dialog should allow users to choose from 5 randomly generated avatars, which are then stored as part of their player profile.*

### Low
N/A

### Done
* **(Done) Alert: Non-existent username entry** - *Reason: When a host adds a username that is not in the system, an alert should appear: "Request {username} to log into PokerUp for a richer experience." Alert style consistent with style design se tin teh application for a normal alert (not destriction or caution).*
    *Alert should have a button on the right "Skip" that clears the Alert* 
    *Alert check is only triggered and displayed after the user navigates out of the input component (to allow them to finish typing and ensure the alert is not premature)*
    *In the lobby page, the alert should appear just above the scroll area and below game name input, pushing the scroll area down slightly. In the dialog box, present the alert above the submit button, extend the dialog height to accomodate* 
* **(Done) Display: Player display name on username validation** - *Reason: When a valid username is entered, the player's display name should appear below the input in the newPlayerCard component to confirm the correct player is selected.  This requires fetching the displayName from Firebase based on the username in the input box. If the username is not found, just reproduce the given username. Use the theme file to see what style is appropriate here. It shoudl be visible but not overpowering. The username should be below the input but still inside the New Player Card component.*
* **(Done) Improve: Card title format** - *Reason: Card titles should use the font and color defined in the application's theme, similar to other pages.*
* **(Done) Refactor: Lobby page structure** - *Reason: The lobby page uses mostly custom CSS. It should be refactored to use existing UI components (Card, Input, Select, Button, ScrollArea, Alert, etc.) for consistency and maintainability.*
* **√Standardize: Theme styling** - *Reason: The lobby page's components are not consistently styled with the application's theme.  The `theme.ts` file should be used to define colors, fonts, backgrounds, and shadows.*
* **(Done) Improve: New player card styling** - *Reason:  The `@newplayercard` component should be wrapped in a Card component so that new player entries are visually distinct.  It should also use theme styling.*
* **(Done) Fix: Currency dropdown opacity** - *Reason: The currency dropdown should be opaque, not transparent.  Ensure the Select component is used correctly.*
* **(Done) Fix: Currency highlight color** - *Reason: The highlight color in the currency dropdown should be changed from yellow to a grey or green hue used elsewhere in the application.*
* **(Done) Fix: Buy-in box currency symbol** - *Reason: The currency symbol in the buy-in input box should automatically update based on the selected currency ($, or INR character).*
* **(Done) Validate: Minimum players for game start** - *Reason: The "Let's Play" button should only trigger game start if at least two players have been added with the required inputs (username and buy-in amount > 0). An alert message should be displayed: "Takes at least 2 to play!"  This alert should disappear after 3 seconds.*
* **(Done) Fix: Username case restriction** - *Reason: Usernames should not allow uppercase letters in the new player card and new player dialog.*
Welcome to the Arena {displayName} -> Display name should jus tbe the first name of the user from the display name. The word before the space. Can modify the string to present it that way. 
* **(Done) Validate: Username input restrictions** - *Reason: Username entry validation now properly restricts input to only lowercase letters, numbers, and underscores. Spaces and special characters are automatically filtered out. This applies to both the lobby page NewPlayerCard component and the in-game Add Player dialog.*
---

## Page 2: In-Game Page

### High

*In the URL, the path should be game/game-name-UID, NOT game/UID. The link is no longer clean. Is there a simpel fix to make this change or more major?*




### Medium

* **Improve: Date and time styling** - *Reason: The date and time display should be styled to be more suitable for the application (instead of black text).*


### Low

* N/A

### Done
* **(Done) Disable: "New Game" tab when game in progress** - *Reason: The "New Game" tab in the sidebar should be disabled when a game is in progress. A message should be displayed under the tab: "Game in Progress!"*
* **(Done) Implement: "Back to Game" button** - *Reason: A button labeled "Back to Game" should appear in the sidebar (above the Navigation section) when a game is in progress. This button should take the user to the URL path of the active game.*
* **(Done) Relocate: Settle Up and Add Player buttons** - *Reason: The "Settle Up" (renamed from "End Game") and "Add Player" buttons should be moved to the bottom of the page.*
    * The "Add Player" button should be at the bottom left.
    * The "End Game" button should be moved to the bottom right.
* **(Done) Implement: Conditional button states for ending game** - *Reason: The "Add Player" button is conditionally rendered by default.*
    * When the "End Game" button is clicked:
        * The "Add Player" button is removed.
        * The "Settle Up" button remains, and the final stack inputs appear.
        * The button text changes to "Settle Up".
    * If the user clicks "Settle Up" again, it triggers the settlement process.*
* **(Done) Validate: Final chip stack before settlement** - *Reason: Before proceeding to settlement, the application should validate that the final chip stack values match the total amount of money in the game. Settlement should not be allowed if final stacks are empty or zero.*
* **(Done) Display: Correct currency sign in GamePlayerCard and rest of the application** - *Reason: The GamePlayerCard should display the currency symbol selected on the lobby page. Same issue everywhere we have currency in the app - every place we are defaulting to "$" right should be dependant on the currency selected in the lobby and its associated currency symbol.*
* **(Done) Remove: Dialog box console warnings** - *Reason:  Resolve the console warnings: "Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}."*
*(Done) The validation for final stack doesnt work if you hit end game and then directly hit settle up without clicking on the input - takes you to the next page. Final stack value must be 0 or higher.  THe validation trigger needs to be changed - cannot go to the next page without adding the final stacks.*
* **(Done) Increase: Total pot and player badge size** - *Reason: The total pot and #players badges in the top banner should be wider for better readability.*
* **(Done) Decrease: dialog width on mobile** - *Reason: dialog box should be 85% of the screen width on mobile devices.*
* **(Done) Change: Add Buy In button color** - *Reason: The "Add Buy In" button in the dialog box should be primary button with white text to avoid confusion with destructive actions (red).*
---

## Page 3: Settlement Page

### High


### Medium
N/A

### Low
* **Replace: "Out of pocket" text** - *Reason: Consider replacing the "Out of pocket" text with a wallet icon.*
* **Replace: "Final Stack" text** - *Reason: Consider replacing the "Final Stack" text with a poker chips icon.*



### Done
* **(Done) Implement: Confirmation for "Settle with AI"** - *Reason:  The game should not be marked as complete until the user clicks "Settle with AI". A message should be displayed: "Click Settle with AI to finish the game".*
* **(Done) Implement: Navigation back to game page** - *Reason:  Users should be able to navigate back to the in-game page to edit final stack values before settling up.*
    *Somebody could make a mistake in their final stack caluclation when they see the settlement page. The game should be triggered complete when the user clicks "settle with AI" Have a message "Click settle with AI to finish the game"*
    *Allow the user to go back to the previous screen to be able to edit their final stack values if needed. And then settle up again.* 
 
* **(Done) Record: Game end timestamp and timer value** - *Reason: When the user clicks "Settle With AI", a server timestamp for the game end time and the final timer value should be recorded in the game document.*
* **(Done) Adjust: Game time data type in Firebase** - *Reason:  Adjust the data type for game time in Firebase so it can be written and read correctly by other app pages.*
* **(Done) Relocate: "Continue to settlement" button** - *Reason: The "Continue to Settlement" button should be moved from within the scroll area to the bottom of the screen, utilizing the empty space and preventing it from overlapping with the scroll area.*
* **(Done) Relocate: Settlement instructions** - *Reason: The settlement instructions have too much empty space below them. This should be adjusted.*
* **(Done) BUG** - *The final stack values are defaulting to zero in the settlement page instead of populating the value from the final stack input when the player clicks on Settle Up button. The settle-up button functionality in the In-Game page was changed and may not have been updated to trigger the final stack in the following page. Also need to check if firestore is properly writing the correct final stack data*
* **(Done) Investigate: Default final stack value** - *Reason: Investigate why the final stack defaults when the final stack is not updated on the previous screen.*
    *Ideally after validation this will not be an issue. but still worth checkign to find if there are any other similar default values in place*
The settle up logic - considers an unfilled final stack as the default buy in instead of 0. if final stack is not filled in. consider it as 0 in default value. 
---

## Page: Past Games Page

### High
N/A

### Medium

* **Display: Player first name** - *Reason: The game card details section should display the player's first name instead of the username.* Display given username if the player is not in the system.
* **Implement: Sorting logic** - *Reason: Implement sorting logic for the past games list.*


### Low

* N/A

### Done
* **(Done) Add: Game duration field** - *Reason: A game duration field has been added to the game collection. Updated the game card to use the gameDuration field for game duration (previously hardcoded to 2h 30m). The duration is now calculated from the gameDuration field stored in minutes and converted to hours and minutes format.*
* **(Done) Handle: Active game display** - *Reason: When a game is in progress, the duration field now displays "Active" instead of the hours/time. Your winnings and ROI are muted (displayed as "--") until the game is finished.*  
* **(Done) Fix: Currency symbol consistency** - *Reason: The details section and card now use the appropriate currency symbol from the game document instead of hardcoding dollars. The currency symbol is fetched using getCurrencySymbol() function from the theme and applied consistently across the card (Total Pot, player net funding, winnings display).*
* **(Done) Handle: Empty winnings and ROI for active games** - *Reason: In the details section, winnings and ROI fields are now empty ("--") and muted in color until the game is complete and properly populated with final data.*

---

## Backend Improvements

### High

* N/A

### Medium

* N/A

### Low

* N/A

### Done
* **Add: Game duration field** - *Reason: Add a field to the game document to record the game duration (calculated from the timer value).*






## Page: Performance Page

### High
The currencies ar enot treated as they should - need to get Yahoo Fiannce API to ocnvert currencies live into the currency that the user wants to see. 

### Medium