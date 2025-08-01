# 🛠️ PokerUp Landing Page: Developer Change Sheet

## 🎨 Design Improvements

### Typography & Visual Hierarchy
- Standardize font sizing tiers:
  - Hero Header: `text-5xl sm:text-6xl`
  - Section Headers: `text-3xl sm:text-4xl`
  - Subheaders: `text-xl sm:text-2xl`
  - Body Text: `text-base sm:text-lg`
- Add vertical spacing: `gap-y-16` or `space-y-12`
- Use font weight selectively—don't bold everything

### Color & Background Enhancements
- Apply section-specific gradients using theme green. For illustrative example:
  - Hero: `from-green-100 to-white`
  - Features: `from-white to-gray-100`
  - Footer: darker green or gray gradient
- Use classes like `bg-gradient-to-br` or `bg-gradient-to-r`
- Green accent color from `theme.ts` on buttons, headers, CTAs

### Mobile-First Responsiveness
- Stack content vertically for mobile screens
- Replace hover effects with tap feedback (`active:scale-105`)
- Use Tailwind breakpoints: `sm`, `md`, `lg` to optimize layout

### Other upgrades 
- Add meta tags for page title and description
- Optimize image aspect ratios (aspect-video or aspect-square) for consistency
---


## 🎡 Carousel Enhancements

### Scroll Visibility & Behavior
- Add gradient overlay or edge shadow to suggest scroll
- Enable `overflow-x-scroll` + scroll indicators
- Set up auto-scroll with tap-to-pause functionality

### Layout Tweaks
- Allow partial view of next card to imply swipe direction
- Add `snap-x scroll-smooth` classes
- Reduce internal card padding to show more content

---

## ✍️ Finalized Copy for Front Page

### 💬 Hero Section
Headline: Play Smarter. Settle Quicker. Win More.

Subheadline: The all-in-one poker tracker built for game-night legends.

CTA Button: [Start Playing]

### How to Play Section
Step 1: Set Your Gamer ID
Create your identity and let others find you fast.

Step 2: Host & Invite
Start the table, share the link—your game, your rules.

Step 3: Play & Track
Watch stats unfold as the stakes rise—fully automated.

Step 4: Settle Up with AI
End the game with frictionless, AI-backed payouts.

### Features
🎮 Real-Time Game Tracking
Track buy-ins, re-buys, and player stacks live. No manual tallying.

🤖 AI-Powered Settlement
Find the simplest way to settle post-game—smart, fast, fair.

📊 Game History & Analytics
Get player trends, ROI stats, and win/loss streaks across all games.
