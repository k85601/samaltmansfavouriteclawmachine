// ============================================================
//  CLAW MACHINE GAME — Main Engine
//  Physics: gravity, Newton's laws, collision, grip force
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;   // 500
const H = canvas.height;  // 520

// ── GAME STATE ──────────────────────────────────────────────
const state = {
  score: 0,
  coins: 5,
  wins: 0,
  phase: 'idle',  // idle | moving | dropping | grabbing | returning | releasing
  frameCount: 0,
};

// ── CLAW ─────────────────────────────────────────────────────
const claw = {
  x: W / 2,
  y: 60,
  baseY: 60,
  width: 44,
  height: 28,
  speed: 3.2,
  dropSpeed: 4,
  returnSpeed: 5,
  open: true,
  grabbing: false,
  // Physics body for rope
  ropeLength: 0,
  maxRope: H - 140,
  gripForceN: 12,  // Newtons
};

// ── PRIZES ───────────────────────────────────────────────────
const PRIZE_DEFS = [
  { emoji: '🐻', label: 'Bear',       mass: 0.8, width: 38, height: 38, value: 10, color: '#c8860a' },
  { emoji: '🦄', label: 'Unicorn',    mass: 0.6, width: 36, height: 36, value: 20, color: '#d45fd4' },
  { emoji: '⭐', label: 'Star',       mass: 0.4, width: 30, height: 30, value: 15, color: '#ffe600' },
  { emoji: '🎮', label: 'Gamepad',    mass: 1.0, width: 38, height: 32, value: 25, color: '#333' },
  { emoji: '💎', label: 'Diamond',    mass: 0.3, width: 28, height: 28, value: 50, color: '#00cfff' },
  { emoji: '🍭', label: 'Candy',      mass: 0.5, width: 30, height: 30, value: 8,  color: '#ff6b9d' },
  { emoji: '🚀', label: 'Rocket',     mass: 0.7, width: 32, height: 36, value: 30, color: '#ff4500' },
  { emoji: '🤖', label: 'Robot',      mass: 1.1, width: 36, height: 38, value: 35, color: '#9edfff' },
];

let prizes = [];
let grabbedPrize = null;
let pendulum = { angle: 0, angVel: 0, length: 60 };
let particles = [];

// ── BOUNDARIES ───────────────────────────────────────────────
const FLOOR_Y = H - 40;
const WALL_LEFT = 20;
const WALL_RIGHT = W - 20;
const CHUTE_X = W - 60;
const CHUTE_Y = FLOOR_Y - 10;

// ── SPAWN PRIZES ─────────────────────────────────────────────
function spawnPrizes() {
  prizes = [];
  const count = 10 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i++) {
    const def = PRIZE_DEFS[Math.floor(Math.random() * PRIZE_DEFS.length)];
    prizes.push({
      ...def,
      x: WALL_LEFT + 30 + Math.random() * (WALL_RIGHT - WALL_LEFT - 60),
      y: FLOOR_Y - def.height / 2 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 0,
      resting: false,
      id: i,
      collected: false,
    });
  }
}

// ── PARTICLE FX ──────────────────────────────────────────────
function spawnParticles(x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1,
      decay: 0.02 + Math.random() * 0.03,
      size: 4 + Math.random() * 6,
      color,
    });
  }
}

function updateParticles() {
  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15; // gravity on particles
    p.life -= p.decay;
  }
  particles = particles.filter(p => p.life > 0);
}

// ── INPUT ─────────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space') {
    e.preventDefault();
    tryDrop();
  }
});
window.addEventListener('keyup', e => keys[e.code] = false);

document.getElementById('btn-left').addEventListener('mousedown', () => keys['ArrowLeft'] = true);
document.getElementById('btn-left').addEventListener('mouseup', () => keys['ArrowLeft'] = false);
document.getElementById('btn-left').addEventListener('touchstart', e => { e.preventDefault(); keys['ArrowLeft'] = true; });
document.getElementById('btn-left').addEventListener('touchend', () => keys['ArrowLeft'] = false);

document.getElementById('btn-right').addEventListener('mousedown', () => keys['ArrowRight'] = true);
document.getElementById('btn-right').addEventListener('mouseup', () => keys['ArrowRight'] = false);
document.getElementById('btn-right').addEventListener('touchstart', e => { e.preventDefault(); keys['ArrowRight'] = true; });
document.getElementById('btn-right').addEventListener('touchend', () => keys['ArrowRight'] = false);

document.getElementById('btn-drop').addEventListener('click', tryDrop);
document.getElementById('btn-insert').addEventListener('click', insertCoin);

function tryDrop() {
  if (state.phase === 'idle' && state.coins > 0) {
    state.coins--;
    updateUI();
    state.phase = 'dropping';
    claw.open = true;
    claw.grabbing = false;
    grabbedPrize = null;
  }
}

function insertCoin() {
  state.coins += 5;
  updateUI();
  showMessage('🪙 +5 COINS\nINSERTED!', 800);
}

// ── UPDATE CLAW ───────────────────────────────────────────────
function updateClaw() {
  if (state.phase === 'idle') {
    // Horizontal movement
    if (keys['ArrowLeft']) {
      claw.x = Math.max(WALL_LEFT + claw.width / 2, claw.x - claw.speed);
    }
    if (keys['ArrowRight']) {
      claw.x = Math.min(WALL_RIGHT - claw.width / 2, claw.x + claw.speed);
    }
    claw.ropeLength = 0;
    claw.y = claw.baseY;
  }

  else if (state.phase === 'dropping') {
    claw.ropeLength += claw.dropSpeed;
    claw.y = claw.baseY + claw.ropeLength;

    // Check if claw reached floor or a prize
    const clawBottom = claw.y + claw.height / 2;

    if (clawBottom >= FLOOR_Y - 10) {
      // Hit the floor, try to grab
      claw.open = false;
      state.phase = 'grabbing';
      setTimeout(() => state.phase = 'returning', 300);
    } else {
      // Check prize collision
      for (let p of prizes) {
        if (!p.collected && PHYSICS.aabbOverlap(
          { x: claw.x, y: claw.y + 10, width: claw.width - 8, height: 12 },
          p
        )) {
          claw.open = false;
          state.phase = 'grabbing';
          const canGrab = PHYSICS.canGrip(claw.gripForceN, p);
          if (canGrab) {
            grabbedPrize = p;
            p.vx = 0; p.vy = 0; p.resting = false;
            spawnParticles(p.x, p.y, '#00f5ff');
          }
          setTimeout(() => state.phase = 'returning', 300);
          break;
        }
      }
    }
  }

  else if (state.phase === 'grabbing') {
    // Claw closes — nothing to do, handled by setTimeout
  }

  else if (state.phase === 'returning') {
    claw.ropeLength -= claw.returnSpeed;
    claw.y = claw.baseY + claw.ropeLength;

    // Swing grabbed prize as pendulum
    if (grabbedPrize) {
      PHYSICS.swingUpdate(pendulum);
      grabbedPrize.x = claw.x + Math.sin(pendulum.angle) * pendulum.length;
      grabbedPrize.y = claw.y + claw.height / 2 + pendulum.length * Math.cos(pendulum.angle);
    }

    if (claw.ropeLength <= 0) {
      claw.ropeLength = 0;
      claw.y = claw.baseY;
      state.phase = 'releasing';
      claw.open = true;
      pendulum.angle = 0;
      pendulum.angVel = 0;
    }
  }

  else if (state.phase === 'releasing') {
    if (grabbedPrize) {
      // Drop the prize — initial velocity from pendulum
      grabbedPrize.vx = pendulum.angVel * pendulum.length * 2;
      grabbedPrize.vy = -1;
      grabbedPrize.resting = false;

      // Check if prize lands in chute (win condition)
      checkWin(grabbedPrize);
      grabbedPrize = null;
    }
    state.phase = 'idle';

    if (state.coins === 0 && prizes.filter(p => !p.collected).length > 0) {
      setTimeout(() => showMessage('GAME OVER!\nNo coins left.\n\nInsert more coins!'), 500);
    }
  }
}

// ── WIN CHECK ─────────────────────────────────────────────────
function checkWin(prize) {
  // Prize is considered "won" if it lands near the chute
  setTimeout(() => {
    if (prize.x > CHUTE_X - 50 && prize.x < W - 10) {
      prize.collected = true;
      state.score += prize.value;
      state.wins++;
      updateUI();
      spawnParticles(prize.x, prize.y, '#ffe600', 20);
      showMessage(`🏆 YOU GOT\n${prize.emoji} ${prize.label}!\n+${prize.value} pts`);
    }
  }, 800);
}

// ── PHYSICS UPDATE ────────────────────────────────────────────
function updatePhysics() {
  for (let p of prizes) {
    if (p.collected) continue;
    if (p === grabbedPrize) continue;

    PHYSICS.integrate(p);
    PHYSICS.resolveFloorCollision(p, FLOOR_Y);
    PHYSICS.resolveWallCollision(p, WALL_LEFT, WALL_RIGHT);

    // Prize-to-prize collision (simple overlap push)
    for (let q of prizes) {
      if (q === p || q.collected || q === grabbedPrize) continue;
      if (PHYSICS.aabbOverlap(p, q)) {
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const push = 0.5;
        p.vx += (dx / dist) * push;
        q.vx -= (dx / dist) * push;
        p.vy += (dy / dist) * push * 0.3;
        q.vy -= (dy / dist) * push * 0.3;
        p.resting = false;
        q.resting = false;
      }
    }
  }
}

// ── DRAW ──────────────────────────────────────────────────────
function draw() {
  ctx.clearRect(0, 0, W, H);

  drawBackground();
  drawRail();
  drawChute();
  drawRope();
  drawPrizes();
  drawClaw();
  drawParticles();
  drawHUD();
}

function drawBackground() {
  // Floor
  ctx.fillStyle = '#0d0d22';
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(0,245,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Floor
  const floorGrad = ctx.createLinearGradient(0, FLOOR_Y - 4, 0, FLOOR_Y + 30);
  floorGrad.addColorStop(0, '#00f5ff');
  floorGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(WALL_LEFT, FLOOR_Y, WALL_RIGHT - WALL_LEFT, 6);

  // Walls
  ctx.strokeStyle = 'rgba(0,245,255,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(WALL_LEFT, 40); ctx.lineTo(WALL_LEFT, FLOOR_Y);
  ctx.moveTo(WALL_RIGHT, 40); ctx.lineTo(WALL_RIGHT, FLOOR_Y);
  ctx.stroke();
}

function drawRail() {
  // Horizontal rail at top
  ctx.fillStyle = '#1a1a3e';
  ctx.fillRect(WALL_LEFT, claw.baseY - 16, WALL_RIGHT - WALL_LEFT, 12);
  ctx.strokeStyle = '#00f5ff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(WALL_LEFT, claw.baseY - 16, WALL_RIGHT - WALL_LEFT, 12);

  // Rail glow
  ctx.shadowColor = '#00f5ff';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(WALL_LEFT, claw.baseY - 10);
  ctx.lineTo(WALL_RIGHT, claw.baseY - 10);
  ctx.strokeStyle = 'rgba(0,245,255,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawChute() {
  // Prize chute on the right
  ctx.fillStyle = '#1a1a3e';
  ctx.fillRect(CHUTE_X, FLOOR_Y - 60, W - CHUTE_X, 70);
  ctx.strokeStyle = '#ff007f';
  ctx.lineWidth = 2;
  ctx.strokeRect(CHUTE_X, FLOOR_Y - 60, W - CHUTE_X, 70);

  ctx.fillStyle = '#ff007f';
  ctx.font = 'bold 11px Rajdhani';
  ctx.fillText('CHUTE', CHUTE_X + 6, FLOOR_Y - 40);

  // Arrow pointing to chute
  if (state.phase === 'returning' && grabbedPrize) {
    ctx.fillStyle = 'rgba(255,0,127,0.6)';
    ctx.font = '18px monospace';
    ctx.fillText('→', CHUTE_X - 26, FLOOR_Y - 22);
  }
}

function drawRope() {
  if (claw.ropeLength <= 0) return;
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(claw.x, claw.baseY);
  ctx.lineTo(claw.x, claw.y - claw.height / 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawClaw() {
  const cx = claw.x;
  const cy = claw.y;
  const hw = claw.width / 2;
  const open = claw.open;

  // Claw body (pulley housing)
  ctx.fillStyle = '#1e1e4a';
  ctx.strokeStyle = '#00f5ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cx - hw, cy - 16, claw.width, 16, 4);
  ctx.fill(); ctx.stroke();

  // Claw arms
  const spread = open ? 20 : 6;
  const armColor = claw.open ? '#00f5ff' : '#ff007f';

  ctx.strokeStyle = armColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // Left arm
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy);
  ctx.lineTo(cx - spread, cy + 22);
  ctx.stroke();

  // Right arm
  ctx.beginPath();
  ctx.moveTo(cx + 4, cy);
  ctx.lineTo(cx + spread, cy + 22);
  ctx.stroke();

  // Claw tips (hooks)
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx - spread, cy + 22, 5, 0, Math.PI * 0.8);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx + spread, cy + 22, 5, Math.PI * 0.2, Math.PI);
  ctx.stroke();

  // Glow
  ctx.shadowColor = armColor;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy);
  ctx.lineTo(cx - spread, cy + 22);
  ctx.moveTo(cx + 4, cy);
  ctx.lineTo(cx + spread, cy + 22);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawPrizes() {
  for (let p of prizes) {
    if (p.collected) continue;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(p.x, FLOOR_Y + 2, p.width / 2, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Prize emoji
    ctx.font = `${p.width}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.emoji, p.x, p.y);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawParticles() {
  for (let p of particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawHUD() {
  // Phase indicator
  const phaseColors = {
    idle: '#00f5ff', dropping: '#ffe600',
    grabbing: '#ff007f', returning: '#39ff14', releasing: '#ff007f'
  };
  ctx.fillStyle = phaseColors[state.phase] || '#fff';
  ctx.font = '600 11px Rajdhani';
  ctx.fillText(`[ ${state.phase.toUpperCase()} ]`, 26, H - 14);

  // Speed display
  const speed = Math.abs(claw.ropeLength > 0 ?
    (state.phase === 'dropping' ? claw.dropSpeed : claw.returnSpeed) : 0);
}

// ── UI UPDATES ────────────────────────────────────────────────
function updateUI() {
  document.getElementById('score').textContent = state.score;
  document.getElementById('coins').textContent = state.coins;
  document.getElementById('wins').textContent = state.wins;
}

let msgTimer = null;
function showMessage(text, autoClose = 0) {
  document.getElementById('message-text').textContent = text;
  document.getElementById('message-overlay').classList.remove('hidden');
  if (autoClose > 0) {
    if (msgTimer) clearTimeout(msgTimer);
    msgTimer = setTimeout(hideMessage, autoClose);
  }
}
function hideMessage() {
  document.getElementById('message-overlay').classList.add('hidden');
}
document.getElementById('message-ok').addEventListener('click', hideMessage);

// ── GAME LOOP ─────────────────────────────────────────────────
function gameLoop() {
  state.frameCount++;
  updateClaw();
  updatePhysics();
  updateParticles();
  draw();
  requestAnimationFrame(gameLoop);
}

// ── INIT ──────────────────────────────────────────────────────
function init() {
  spawnPrizes();
  updateUI();
  gameLoop();
  setTimeout(() => showMessage('🎮 CLAW MACHINE\n\nMove: ← →  |  Drop: SPACE\n\nGrab prizes & drop\nthem in the CHUTE!\n\nGOOD LUCK!'), 500);
}

init();
