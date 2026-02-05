# StoichMaster

A gamified chemistry practice platform with XP progression, ranks, global leaderboard, and step-by-step tutorials. Master stoichiometry, unit conversions, and chemical equation balancing!

## 🎮 Features

### Core Practice Modes
- **Stoichiometry**: Mass/moles/molecules conversions
- **Unit Conversion**: Metric and chemical units
- **Equation Balancing**: Interactive coefficient balancing

### 🆕 New Features

#### 1. **User Authentication (Supabase)**
- Sign in with Google
- Email/password authentication
- Anonymous guest mode
- Persistent data across devices

#### 2. **Global Leaderboard**
- Compete with players worldwide
- Real-time rankings by XP
- View top 100 players
- See accuracy and stats

#### 3. **Step-by-Step Tutorial Mode**
- Interactive walkthroughs for each practice type
- Visual highlighting of key elements
- Example problems with solutions
- Progress tracking through tutorial steps

### Existing Features
- **6 Rank Tiers** (21 unique ranks from Helium to Francium)
- **4 Difficulty Levels** (Easy, Medium, Hard, Extreme)
- **XP System** with multipliers and speed bonuses
- **Comprehensive Stats** (daily, weekly, monthly)
- **Interactive Charts** using Chart.js
- **Streak System** for consecutive correct answers

## 🚀 Setup Instructions

### 1. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL from `SUPABASE_SETUP.md` to create tables
3. Enable authentication providers (Google, Email, Anonymous)
4. Get your API credentials from Settings → API

### 2. Update Configuration

Edit `config.js` with your Supabase credentials:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key-here'
};
```

### 3. Run Locally

```bash
# Open in browser
open index.html

# Or use a local server
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## 📚 How to Use

### Practice Problems
1. Select difficulty level (Easy → Extreme)
2. Choose a practice type
3. Solve the problem (timer starts automatically)
4. Earn XP based on difficulty and speed
5. Track progress and climb ranks

### Tutorial Mode
1. Click the **Tutorial** button on any practice page
2. Follow step-by-step instructions
3. See highlighted examples and explanations
4. Navigate with Previous/Next buttons
5. Exit anytime or complete all steps

### Leaderboard
1. Sign in to access the global leaderboard
2. View top players and their stats
3. See your ranking position
4. Refresh to see latest standings

## 🏆 Rank System

**Tier 1: The Noble Gases (Inert)** - 0-500 XP
- Helium (He), Neon (Ne), Argon (Ar), Krypton (Kr)

**Tier 2: The Metalloids (Semi-Reactive)** - 800-2,300 XP
- Boron (B), Silicon (Si), Germanium (Ge), Antimony (Sb)

**Tier 3: The Halogens (Highly Reactive)** - 3,000-5,700 XP
- Iodine (I), Bromine (Br), Chlorine (Cl), Fluorine (F)

**Tier 4: The Alkaline Earths (Radical)** - 6,800-10,700 XP
- Beryllium (Be), Magnesium (Mg), Calcium (Ca), Barium (Ba)

**Tier 5: The Alkali Metals (Explosive)** - 12,200-17,300 XP
- Lithium (Li), Sodium (Na), Potassium (K), Cesium (Cs)

**Tier 6: The Super-Actives (Master)** - 20,000+ XP
- Francium (Fr) - The Ultimate Rank!

## 🎯 Difficulty Levels

| Difficulty | XP Multiplier | Speed Bonus | Best For |
|------------|---------------|-------------|----------|
| Easy | 1x | +5 XP | Beginners |
| Medium | 1.5x | +10 XP | Intermediate |
| Hard | 2x | +15 XP | Advanced |
| Extreme | 3x | +25 XP | Experts |

## 💾 Data Storage

- **Local**: XP and stats stored in browser localStorage
- **Cloud**: User profiles and leaderboard in Supabase
- **Sync**: Automatic sync when signed in
- **Offline**: Works offline, syncs when online

## 🛠️ Technology Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## 📁 Project Structure

```
stoichmaster/
├── index.html          # Main HTML file
├── script.js           # Main application logic
├── config.js           # Supabase configuration
├── supabase.js         # Authentication & database
├── tutorial.js         # Step-by-step tutorials
├── ranks.js            # Rank system & difficulty
├── stats.js            # Statistics tracking
├── SUPABASE_SETUP.md   # Database setup guide
└── README.md           # This file
```

## 🔒 Security

- Row Level Security (RLS) enabled
- Users can only update their own data
- Public leaderboard viewing
- Secure authentication via Supabase
- API keys are safe to expose (anon key only)

## 🆓 Free Tier Limits

**Supabase Free Tier:**
- 500 MB database storage
- 50,000 monthly active users
- 2 GB bandwidth
- Unlimited API requests

Perfect for educational sites!

## 🚀 Deployment

Deploy to any static hosting platform:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop to [netlify.com/drop](https://netlify.com/drop)
- **GitHub Pages**: Push to GitHub and enable Pages
- **Cloudflare Pages**: Connect repository

## 🤝 Contributing

Suggestions for new features:
- More chemistry topics (acids/bases, redox, etc.)
- Multiplayer challenges
- Daily quests
- Achievement badges
- Mobile app version

## 📝 License

Open source for educational use.

## 🎓 Educational Value

StoichMaster helps students:
- Master fundamental chemistry calculations
- Build problem-solving speed and accuracy
- Learn through interactive tutorials
- Track progress over time
- Compete and stay motivated
- Practice at their own pace

---

**Made with ⚗️ for chemistry students everywhere!**
