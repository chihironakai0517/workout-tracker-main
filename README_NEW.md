# 💪 Fitness Tracker - Workout & Health Management App

A powerful, mobile-first web application for tracking workouts, nutrition, and fitness goals. Built with **Next.js**, **React**, and **TypeScript**, with PWA support for offline functionality.

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=flat-square)
![React](https://img.shields.io/badge/React-18.3-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-Progressive%20Web%20App-blueviolet?style=flat-square)

## ✨ Features

### 🏋️ Workout Tracking
- Log custom and preset exercises
- Track weight exercises (sets, reps, weight) and cardio (duration, distance, calories)
- Workout history with detailed summaries
- Rest timer with background support
- Exercise progress analytics

### 📊 Health Monitoring
- Body measurements tracking (weight, body fat %, muscle mass, etc.)
- Weekly/monthly progress charts
- Nutrition overview with macro tracking
- Daily calorie and macro goals
- Health metrics visualization

### 📱 Mobile-First Design
- Fully responsive layout optimized for phones, tablets, and desktops
- Progressive Web App (PWA) with offline support
- Background timer functionality
- Works without internet connection
- Install as standalone app on mobile devices

### 🔔 Notifications & Timers
- Rest timer between sets with sound & vibration
- Customizable timer settings
- Background timer (works when app is minimized)
- Automatic workout session tracking

### 💾 Data Management
- Local storage for all data
- Sync between devices (export/import)
- Persistent storage with automatic backups

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/workout-tracker.git
cd workout-tracker

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Generate Icons

```bash
npm run generate-icons
```

## 📁 Project Structure

```
workout-tracker/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── page.tsx      # Dashboard home
│   │   ├── health/       # Health tracking pages
│   │   └── workout/      # Workout management pages
│   ├── components/       # Reusable components
│   │   ├── ui/           # Shadcn UI components
│   │   └── Timer.tsx     # Workout timer
│   └── lib/              # Utility functions & hooks
├── public/               # Static assets & PWA config
│   ├── manifest.json     # PWA manifest
│   ├── sw.js            # Service Worker for background timer
│   └── icons/           # App icons
└── scripts/             # Build scripts
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) - React meta-framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [PostCSS](https://postcss.org/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Charts**: [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Storage**: Browser LocalStorage + Service Worker
- **PWA**: Service Worker + Web App Manifest

## 📱 Mobile Support

### Progressive Web App (PWA)
- **Install as App**: Add to home screen on iOS/Android
- **Offline Mode**: All core features work offline
- **Background Timers**: Timers continue running in background
- **Push Notifications**: Optional workout reminders
- **Fast Loading**: Optimized caching strategy

### Device Requirements
- Modern browser with Service Worker support
- Minimum viewport: 320px width (mobile)
- Recommended: iOS 11+, Android 5+

### Browser Support
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Samsung Internet 14+

## 📊 Pages & Features

| Page | Description |
|------|-------------|
| `/` | Dashboard with workout calendar and stats |
| `/workout/new` | Create new workout session |
| `/workout/edit/:id` | Edit existing workout |
| `/workout/history` | Workout history and summaries |
| `/workout/progress` | Workout analytics and trends |
| `/workout/sync` | Sync data between devices |
| `/health/measurements` | Track body measurements |
| `/health/meal` | Log meals and nutrition |
| `/health/goals` | Set and manage fitness goals |
| `/health/nutrition` | Nutrition tracking overview |
| `/health/summary` | Health analytics (Weekly/Monthly) |

## 🎨 UI/UX Improvements

- **Responsive Design**: Mobile-first approach for all screen sizes
- **Dark Mode Ready**: CSS variables support for theme switching
- **Accessible**: WCAG compliant components and keyboard navigation
- **Smooth Animations**: Tailwind CSS transitions and animations
- **Touch Friendly**: Large touch targets (44px+ minimum)

## 🌐 Deployment

### Deploy on Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel automatically detects Next.js and configures build settings
5. Click Deploy!

**Environment Variables**: None required for basic functionality

### Deploy on Other Platforms

**Netlify:**
```bash
npm run build
# Deploy the `.next` and `public` directories
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Development Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start               # Start production server
npm run lint            # Run ESLint
npm run generate-icons  # Generate app icons from SVG
npm run check-encoding  # Check file encoding
```

## 🔒 Data Privacy

- **Local First**: All data stored locally in browser
- **No Cloud**: No external server communication (except for optional sync)
- **User Control**: Users control all their data
- **Offline**: Works completely offline without data transmission

## 🐛 Troubleshooting

### Timer not starting on "Add Exercise"
- Clear browser cache and reload
- Ensure Service Worker is registered (`/sw.js`)
- Check browser console for errors

### Data not persisting
- Check if LocalStorage is enabled
- Verify browser is not in private/incognito mode
- Try a different browser

### PWA not installable
- Open site in HTTPS (or localhost for dev)
- Check `manifest.json` in browser DevTools
- Service Worker must be registered successfully

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, suggestions, or questions:
1. Check existing [GitHub Issues](https://github.com/yourusername/workout-tracker/issues)
2. Create a new issue with detailed description
3. Include browser and device information

---

**Made with 💪 for fitness enthusiasts**
