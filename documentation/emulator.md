Changes we made for development only - due to using emulators 
In the coud function we changed 
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
            TO
    createdAt: Timestamp.now(), WITH THE IMPORT - import { Timestamp } from "firebase-admin/firestore"; - dont need either in production.
    Change this back when done testing 

We also added email sign in addition to google auth - remove from page.tsx in the main root page of the app 