
**Loby**

Refactor the lobby page. It was built with mostly custom css before the components were installed in the application. We need to refactor it to use the exisiting components where needed - 
    Card, Input, Select, Button, ScrollArea, Alert etc - where required and where they can be replaced. 
    Second, we need to use the theme.ts file to style the components - use the theme file to reference what the colour should be, font, backgrounds, shadows etc. All these are standard within my application. You can look at the Settlement Page for a reference. 
    Do the same with the @newplayercard compoentn - wrap each new component in a card such that in the lobby page, new player entires render as nested cards that are distinct from each other (right now it just flows one from another). It already uses the input component which is good. We should also make this use the theme styling consistent with the application. 


Card Title format can be improved 
    Right now just regular black. - Can use the font and colour used in other pages for card titles
    Is the card component being used to build the player cards and the outer card? Maybe using custom css thats why the page isnt looking the same as other pages. 


Currency - 
    Drop down should be opaque instead of transaprent - use the select component properly if not alrady being used. 
    Change highlight colour from (current) yellow to grey or green hue used in the rest of the app.
    The buy-in box currency should automatically update with the currency in the select option 
        If CAD or USD - show $, otherwise INR currency character. 

username input in all places (newPlayerCard, new player dialog) should not allow uppercase letters

The "Lets Play" button should only trigger game start if there are at least two players that have been added with required inputs (username and >0 buy in amounts) The game should not start with less than two players. Use an Alert Message that says "Takes at least 2 to play! 
    TO DO - This alert should be removed after 3 seconds - not be persistent. 

**DONE^**
---------


If user enters a username that is not in the system, get a toast component alert -
    "request user to log into PokerUp to update their game data" 
    or something along those lines which achieves the effect with minimal words 
    Should only appear the first time the host adds a username that is not in the system. Once the alert is shown, dont have to show it for every player. Key to note that the non-recognized username could be implemented at anytime in the game - in any of the lobby newPlayerCards or in the new player add dialog as well in the [ID] page. 

When the username is being validated, when an existing user is selected, a new line should appear below the input with the player's Display Name to confirm that that is the player on file. This will have to be updated in the newPlayerCard component - adding a new line of text (with the right theme formatting) We will have to check if the username exists and if it does, fetch the displayName field from firebase. getDoc already exists in firestoreUtils so use that function here. 



On set-username dialog, the user can also be given an option of choosing between 5 randomly generated avatars - once they choose their avatar, it is stored as a part of their player profile 




**In-Game**

What should happen when there is an active game and the host clicks on new game? Right now, in the UI they are presented with a new game and thus losing their existing running game. We should disable "new Game" tab inside the side bar when a game is already active with a small messgae underneath the New Game tab like "Game in Progress!" that shows the user why they cannot navigate away from the game. 
    However, this introduces the other issue - if the host wants to navigate to their performance page or another page, how do they navigate back to the game in progress? KEY to solve. 

Settle Up and Add Player buttons can be made shorted in length to give more space to the game name 

Date and time styling can be be more suitible for the application instead of a black text 

Add New Player dialog box should be 85% of the width on mobile 

Add Buy In button in dialog box should be Green as well - red can confuse 


Continue to settlement:
    Validate that the final chip stack actually matches the amount of money in the game. 
    Cannot settle up if player final stacks have not been updated (cannot be empty, can be zero)

Why is final stack defaulting to the buy in when the final stack was not updated in the previous screen? Check if there was a default value set during building the function when final stack is empty 

Dialog box has multiple warnings in concole - "Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}."

**Settlement**
Could consider replacing "Out of pocket" with the wallet icon 
Could consider replacing "Final Stack" with the poker chips icon 

Dont need decimals in the player card 

No Sidebar Menu button 

Too much spacing at the end of the scroll area and end fo the screen. instead of having an empty space, use that to place the "Continue to settlement" button. The button currently cuts into the scroll area space (effectively pushing the scroll area even higher and therefore smaller) instead of getting added to the bottom. 
`Same issue with settleemnt instructions - too much empty space at the bottom. 

Above the "Game Summary" have the name of the game 

Somebody could make a mistake in their final stack caluclation when they see the settlement page. The game should be triggered complete when the user clicks "settle with AI" Have a message "Click settle with AI to finish the game"
    Allow the user to go back to the previous screen to be able to edit their final stack values if needed. And then settle up again. 


**DATA**
Add a field at the end of the game that also records how long the game lasted (can be taken from the clock we have running or the difference in timestamps from game creation to settlement)

**Past Games**
add a pill in the card that shows status of the game - complete / in progress
in the gamecard details section, should display player first name, not username. 
need to add game duration field in the game collection - hardcoded for now.
add sorting logic