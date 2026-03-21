# 🗺️ India Quest — CBSE RPG Learning Game

An AI-powered, role-playing game where kids travel across India solving CBSE syllabus puzzles. Built with React + Vite. Deployed on Vercel or GitHub Pages.

---

## 🎮 What is India Quest?

India Quest is a **Free Fire / Call of Duty–style learning RPG** for CBSE students (Classes 1–5). Instead of shooting enemies, players:

- 🗺️ **Travel across India** — unlock Delhi → Jaipur → Mumbai → Bengaluru → Chennai
- 🏙️ **Explore top-down city grids** — walk your hero to subject buildings
- 🏛️ **Enter buildings floor-by-floor** — Easy (Floor 1) → Medium (Floor 2) → Boss (Floor 3)
- 🧩 **Solve 5 puzzle types** — Visual MCQ, Fill-in-the-blank, Match pairs, Word scramble, Math builder
- ✨ **AI generates 10,000+ questions** — Claude AI creates fresh CBSE questions automatically, covering every chapter

### Subjects covered
| Subject | Classes |
|---------|---------|
| English | 1–5 |
| Maths | 1–5 |
| EVS / Science | 1–5 |
| Hindi | 1–5 |
| Social Studies | 3–5 |
| India Map | 1–5 |

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/india-quest.git
cd india-quest
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Edit .env and add your Anthropic API key
```

### 3. Start dev server
```bash
npm run dev
# Open http://localhost:3000
```

> **Note:** The game works without an API key using built-in seed questions. AI generation activates when you add your key.

---

## 🌐 Deployment

### Option A — Vercel (Recommended, full AI support)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project → Select your repo
3. In Vercel dashboard → Settings → Environment Variables:
   - Add `ANTHROPIC_API_KEY` = your key from [console.anthropic.com](https://console.anthropic.com)
4. Click Deploy ✅

The `/api/generate.js` serverless function keeps your API key safe on the server side.

### Option B — GitHub Pages (Static, uses seed questions)

1. In `vite.config.js`, set `base: '/india-quest/'` (your repo name)
2. Push to `main` branch
3. Go to **GitHub repo → Settings → Pages → Source: GitHub Actions**
4. The `.github/workflows/deploy.yml` will build and deploy automatically

> GitHub Pages is static — it cannot run the `/api` serverless function. The game uses built-in seed questions instead of AI generation on GitHub Pages.

### Option C — Netlify

```bash
npm run build
# Drag the dist/ folder to netlify.com/drop
```
Add `ANTHROPIC_API_KEY` in Netlify → Site settings → Environment variables.

---

## 📁 Project Structure

```
india-quest/
├── api/
│   └── generate.js          ← Vercel serverless function (AI question gen)
├── public/
│   └── favicon.svg
├── src/
│   ├── config.js             ← Game constants (HP, XP, rewards etc.)
│   ├── main.jsx              ← React entry point
│   ├── App.jsx               ← Screen routing + navigation
│   ├── data/
│   │   ├── cities.js         ← India map cities & routes
│   │   ├── buildings.js      ← Buildings per city
│   │   └── syllabus.js       ← 525 CBSE topics (15 per subject/class)
│   ├── hooks/
│   │   └── usePlayer.js      ← Zustand player state + IndexedDB save
│   ├── services/
│   │   ├── storage.js        ← IndexedDB question pool persistence
│   │   └── aiGenerator.js    ← AI generation + non-repeating picker
│   ├── screens/
│   │   ├── IntroScreen.jsx   ← Hero selection + name entry
│   │   ├── MapScreen.jsx     ← India SVG map
│   │   ├── CityScreen.jsx    ← Top-down RPG grid
│   │   ├── BuildingScreen.jsx ← Floor/room selection
│   │   └── PuzzleScreen.jsx  ← Puzzle gameplay controller
│   ├── components/
│   │   ├── StatsPanel.jsx    ← Question bank stats
│   │   └── puzzles/
│   │       ├── VisualPuzzle.jsx    ← MCQ with images/emojis
│   │       ├── FillPuzzle.jsx      ← Fill in the blank
│   │       ├── MatchPuzzle.jsx     ← Match pairs left↔right
│   │       ├── ScramblePuzzle.jsx  ← Tap letters to unscramble
│   │       └── MathPuzzle.jsx      ← Equation with missing number
│   └── styles/
│       └── index.css         ← Tailwind + custom game CSS
├── .env.example              ← Environment variable template
├── .github/workflows/
│   └── deploy.yml            ← CI/CD for GitHub Pages
├── vercel.json               ← Vercel deployment config
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🧠 How AI Questions Work

```
Player enters Room
     ↓
Check IndexedDB: unseen questions for this subject/class/difficulty?
     ↓
If < 20 unseen → trigger background generation (silent)
     ↓
/api/generate called with: Subject + Class + Difficulty + Topic
     ↓
Claude returns 15 brand-new questions in JSON
     ↓
Appended to cached pool (permanent, survives browser restart)
     ↓
Player gets random unseen question
     ↓
Used-index tracked — never repeats until ALL questions seen
     ↓
When fully exhausted → pool reshuffles + new batch generated
```

### Question capacity
| Factor | Count |
|--------|-------|
| Subjects | 7 |
| Topics per subject/class | 15 |
| Difficulty tiers | 3 |
| Questions per API call | 15 |
| **Base pool per subject/class** | 675 |
| After 15 topic cycles | **10,125** |
| Total across all subjects/classes | **354,375+** |

---

## ⚙️ Game Configuration

All game constants are in `src/config.js`:

```js
export const GAME = {
  MAX_HP: 100,            // Player health
  HP_LOSS_WRONG: 15,      // HP lost per wrong answer
  COINS_PER_CORRECT: 25,  // Coins earned per correct answer
  XP_PER_LEVEL: 300,      // XP needed to level up
  BOSS_TIMER_SEC: 25,     // Boss room countdown
  QUESTIONS_NORMAL: 3,    // Questions per normal room
  QUESTIONS_BOSS: 5,      // Questions per boss room
  // ... more
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State | Zustand |
| Storage | IndexedDB (idb-keyval) |
| AI | Anthropic Claude (Sonnet) |
| Deploy | Vercel / GitHub Pages |
| CI/CD | GitHub Actions |

---

## 📱 Making it a Mobile App (Next Steps)

To convert to a React Native mobile app:
1. Replace `div` → `View`, `p/span` → `Text`, `button` → `TouchableOpacity`
2. Use `@react-native-async-storage/async-storage` instead of IndexedDB
3. Use `react-native-svg` for the India map (same SVG syntax)
4. Use `expo-av` for sound effects
5. Submit to Google Play Store ($25 one-time) and Apple App Store ($99/year)

---

## 📄 License

MIT — free to use, modify, and deploy.

---

Made with ❤️ for Indian students. Powered by Claude AI.
