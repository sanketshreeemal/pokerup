# 🃏 Poker Nights

A mobile-first, multi-user web application for tracking and settling poker game buy-ins and payouts.

## 🚀 Tech Stack

- **Frontend**: React + Next.js (App Router)
- **Styling**: Chakra UI
- **Authentication**: Firebase Auth (Google login)
- **Database**: Firebase Firestore
- **AI Integration**: GPT-4 for settlement calculations
- **Deployment**: Vercel

## 📁 Project Structure

```
poker-nights/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── home/          # Home page with tabs
│   │   ├── game/          # Game management
│   │   └── profile/       # User profile
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── games/         # Game management endpoints
│   │   └── settlement/    # Settlement calculation endpoints
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── game/             # Game-related components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── config/               # Configuration files
│   ├── firebase.ts       # Firebase configuration
│   └── theme.ts          # Chakra UI theme
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── firebase/         # Firebase utilities
│   ├── gpt/              # GPT integration
│   └── utils/            # General utilities
├── models/               # TypeScript interfaces
├── providers/            # Context providers
├── public/               # Static assets
├── styles/               # Global styles
├── types/                # TypeScript type definitions
├── .env.local            # Environment variables
├── .eslintrc.json        # ESLint configuration
├── .gitignore            # Git ignore file
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

## 🛠️ Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Firebase and OpenAI credentials
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📝 Documentation

- [Project Overview](overview/project-overview.md)
- [Progress Tracking](progress.md)

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details. 