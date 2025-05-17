# PokerUp

A modern web application for playing poker with friends, built with Next.js, Firebase, and TypeScript.

## Features

- Google Authentication
- Real-time player tracking
- User profiles with customizable usernames
- Modern, responsive UI with Tailwind CSS

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Firebase
  - Authentication
  - Firestore
  - Cloud Functions
- Tailwind CSS

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/sanketshreeemal/pokerup.git
cd pokerup
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your Firebase configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

4. Run the development server:
```bash
npm run dev
```

5. Deploy Firebase Functions:
```bash
cd functions
npm install
npm run deploy
```

## Project Structure

- `/src/app` - Next.js pages and API routes
- `/src/components` - React components
- `/src/lib` - Utility functions, hooks, and contexts
- `/functions` - Firebase Cloud Functions

## License

MIT