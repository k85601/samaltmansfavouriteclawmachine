# 🏗️ Sam Altmans favourite claw machine
Designing Mr Sam Altman favourite claw machine.
Building Sam Altman`s claw machine wonderland.
<img width="1536" height="1024" alt="GPU claw machine" src="https://github.com/user-attachments/assets/21eb3132-d92e-480a-80f0-313679b2857b" />
<img width="1536" height="1024" alt="Computer heatsink claw machine" src="https://github.com/user-attachments/assets/1af9e3c4-617d-4744-bd90-61f25d0a7170" />

# 🏗️ Claw Machine Investment

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

## 🏗️ How to Invest

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

## 🛠 Tech Stack

- **Frontend**: Vanilla JS + HTML5 Canvas (zero dependencies)
- **Backend**: Node.js + Express
- **Deploy**: Railway.app
- **Physics**: Custom engine (`physics.js`)

---

## 📝 License

MIT

## 📝 Special thanks

Special thanks to Mr Sam Altman contribution and make anything possible.
