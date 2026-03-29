// ============================================================
//  PHYSICS ENGINE — Newton's Laws + Rigid Body Simulation
//  F = ma | Gravity = 9.8 m/s² | Coefficient of Restitution
// ============================================================

const PHYSICS = {
  // Constants
  GRAVITY: 9.8,          // m/s²
  PIXELS_PER_METER: 50,  // scale
  TIME_STEP: 1 / 60,     // 60fps
  RESTITUTION: 0.35,     // bounciness (0=no bounce, 1=perfect)
  FRICTION: 0.82,        // surface friction coefficient
  AIR_RESISTANCE: 0.995, // velocity damping per frame

  // Convert m/s² to px/frame²
  get gravityPx() {
    return this.GRAVITY * this.PIXELS_PER_METER * this.TIME_STEP * this.TIME_STEP;
  },

  /**
   * Verlet integration for position
   * x(t+dt) = x(t) + v(t)*dt + 0.5*a*dt²
   */
  integrate(body) {
    body.vx *= this.AIR_RESISTANCE;
    body.vy *= this.AIR_RESISTANCE;

    // Apply gravity (Newton's 2nd Law: F = ma → a = F/m)
    const gravAccel = this.gravityPx / body.mass;
    body.vy += gravAccel;

    body.x += body.vx;
    body.y += body.vy;
  },

  /**
   * Collision response — elastic collision with energy loss
   * v_after = -e * v_before (coefficient of restitution)
   */
  resolveFloorCollision(body, floorY) {
    const halfH = body.height / 2;
    if (body.y + halfH >= floorY) {
      body.y = floorY - halfH;
      body.vy = -body.vy * this.RESTITUTION;
      body.vx *= this.FRICTION;

      // Stop micro-bouncing
      if (Math.abs(body.vy) < 0.5) {
        body.vy = 0;
        body.resting = true;
      }
    }
  },

  resolveWallCollision(body, minX, maxX) {
    const halfW = body.width / 2;
    if (body.x - halfW <= minX) {
      body.x = minX + halfW;
      body.vx = Math.abs(body.vx) * this.RESTITUTION;
    }
    if (body.x + halfW >= maxX) {
      body.x = maxX - halfW;
      body.vx = -Math.abs(body.vx) * this.RESTITUTION;
    }
  },

  /**
   * AABB collision detection between two rigid bodies
   */
  aabbOverlap(a, b) {
    return (
      Math.abs(a.x - b.x) < (a.width + b.width) / 2 &&
      Math.abs(a.y - b.y) < (a.height + b.height) / 2
    );
  },

  /**
   * Claw grip force check — Newton's 3rd Law
   * If grip force > object weight, it holds
   * F_grip >= m * g
   */
  canGrip(clawForceN, body) {
    const weightN = body.mass * this.GRAVITY;
    // Add slip factor for game balance (75% grip efficiency)
    const effectiveGrip = clawForceN * (0.5 + Math.random() * 0.5);
    return effectiveGrip >= weightN;
  },

  /**
   * Pendulum swing for grabbed prize
   * θ''= -(g/L)*sin(θ) approximated for small angles
   */
  swingUpdate(pendulum) {
    const damping = 0.97;
    const L = pendulum.length;
    const angAccel = -(this.GRAVITY / (L / this.PIXELS_PER_METER)) *
      Math.sin(pendulum.angle) * this.TIME_STEP * this.TIME_STEP;
    pendulum.angVel = (pendulum.angVel + angAccel) * damping;
    pendulum.angle += pendulum.angVel;
  }
};

// Export globally
window.PHYSICS = PHYSICS;
