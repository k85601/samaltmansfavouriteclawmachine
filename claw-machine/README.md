# 🏗️ Claw Machine Game

A physics-based browser claw machine game with real gravity simulation, Newton's Laws, and collision detection. Built with vanilla JS + Canvas, deployable to Railway.app in one click.

---

## 🚀 Quick Start (Local)

```bash
git clone https://github.com/YOUR_USERNAME/claw-machine-game.git
cd claw-machine-game
npm install
npm start
# Open http://localhost:3000
```

---

## 🌐 Deploy to Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project**
3. Select **Deploy from GitHub repo**
4. Choose this repository
5. Railway auto-detects Node.js and runs `npm start`
6. Your game is live at `https://your-app.railway.app` 🎉

> Railway uses `railway.json` for config. The `PORT` env variable is set automatically.

---

## 🎮 How to Play

| Control | Action |
|---|---|
| `←` / `→` Arrow Keys | Move claw left / right |
| `SPACE` or DROP button | Release claw downward |
| Drop prizes into the **CHUTE** (right side) to score! |

---

## ⚙️ Physics Engine

The game simulates real-world physics via `physics.js`:

| Law | Implementation |
|---|---|
| **Newton's 2nd Law** `F = ma` | Gravity acceleration applied per mass: `a = F/m` |
| **Verlet Integration** | `x(t+dt) = x(t) + v(t)·dt + ½·a·dt²` |
| **Coefficient of Restitution** | Bounce damping: `v_after = -e · v_before` (e = 0.35) |
| **Grip Force** `F_grip ≥ m·g` | Claw holds if grip force > prize weight |
| **Pendulum Physics** | Grabbed prizes swing: `θ'' = -(g/L)·sin(θ)` |
| **AABB Collision** | Axis-aligned bounding box between all prizes |
| **Air Resistance** | Velocity damped by 0.5% each frame |
| **Surface Friction** | Horizontal velocity * 0.82 on floor contact |

---

## 📁 File Structure

```
claw-machine-game/
├── server.js          # Express server (Railway-ready)
├── package.json       # Node dependencies
├── railway.json       # Railway deploy config
├── .gitignore
├── README.md
└── public/
    ├── index.html     # Game HTML + UI
    ├── style.css      # Arcade cabinet aesthetic
    ├── physics.js     # Physics engine (gravity, Newton, collisions)
    └── game.js        # Game logic, rendering, input
```

---

## ⚡ Phase 2 — Marvel Cinematic Upgrade Roadmap

Once Phase 1 is deployed and working, here's what to build next:

### 🦸 Visual Overhaul (MCU Style)
- [ ] **Marvel prize skins** — Iron Man helmet, Captain America shield, Thor's hammer, Mjolnir, Infinity Stones
- [ ] **Particle explosion FX** — energy bursts when claw grabs a prize (inspired by repulsor blasts)
- [ ] **Screen shake** — cinematic impact when prizes collide
- [ ] **Dynamic lighting** — glowing auras per prize rarity (Common → Legendary)
- [ ] **Holographic HUD** — Tony Stark-style UI overlay with JARVIS font

### 🎮 Gameplay Mechanics
- [ ] **Electromagnet claw** — attracts metallic prizes, repels others (charge toggle)
- [ ] **Prize rarity tiers** — Common / Rare / Epic / Legendary with drop weights
- [ ] **Power-ups** — Double grip, Slow-mo, Magnet Pulse, Time Warp
- [ ] **Combo multiplier** — consecutive grabs multiply score
- [ ] **Boss round** — giant prize that requires 3 grabs to collect

### 🌐 Multiplayer & Social
- [ ] **WebSocket co-op** — 2 players share the same machine (one moves, one drops)
- [ ] **Global leaderboard** — Railway + PostgreSQL backend for top scores
- [ ] **Spectator mode** — watch others play in real time
- [ ] **Daily challenge** — same seed prizes for all players that day

### 🎵 Audio & Immersion
- [ ] **MCU-style soundtrack** — dramatic score that builds during gameplay
- [ ] **Sound FX** — claw whir, prize grab, win fanfare, coin insert
- [ ] **Voice lines** — "Genius. Billionaire. Playboy. Philanthropist." on win
- [ ] **Vibration API** — mobile haptics on grab/win

### 📱 Platform
- [ ] **PWA** — installable on mobile as an app
- [ ] **Touch gestures** — swipe to move, tap to drop
- [ ] **Landscape lock** — optimal mobile layout
- [ ] **Save state** — persist coins/score via localStorage

---

## 🛠 Tech Stack

- **Frontend**: Vanilla JS + HTML5 Canvas (zero dependencies)
- **Backend**: Node.js + Express
- **Deploy**: Railway.app
- **Physics**: Custom engine (`physics.js`)

---

## 📝 License

MIT
