/**
 * ==========================================================================
 * CYBERBREW — DELICATE COFFEE STEAM CANVAS
 * Organic Translucent Steam Wisps Curling from the Ceramic Cup
 * ==========================================================================
 */

class SteamCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.originX = this.width / 2;
    this.originY = this.height - 15;
    this.isRunning = true;

    this.init();
  }

  init() {
    for (let i = 0; i < 24; i++) {
      this.spawnParticle(Math.random() * this.height);
    }
    this.animate();
  }

  spawnParticle(initialY = null) {
    const y = initialY !== null ? initialY : this.originY;
    this.particles.push({
      x: this.originX + (Math.random() - 0.5) * 24,
      y: y,
      radius: 4 + Math.random() * 8,
      vx: (Math.random() - 0.5) * 0.45,
      vy: -0.4 - Math.random() * 0.55,
      alpha: 0.12 + Math.random() * 0.14,
      curlSpeed: 0.02 + Math.random() * 0.03,
      curlOffset: Math.random() * Math.PI * 2
    });
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.y += p.vy;
      p.x += Math.sin(p.y * p.curlSpeed + p.curlOffset) * 0.45 + p.vx;
      p.radius += 0.14; // expand as it rises
      p.alpha *= 0.988; // fade out

      // Draw soft blurred wisp
      this.ctx.beginPath();
      const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grad.addColorStop(0, `rgba(243, 235, 221, ${p.alpha * 0.7})`);
      grad.addColorStop(0.5, `rgba(243, 235, 221, ${p.alpha * 0.3})`);
      grad.addColorStop(1, 'rgba(243, 235, 221, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();

      if (p.alpha < 0.005 || p.y < 0) {
        this.particles.splice(i, 1);
        this.spawnParticle();
      }
    }

    requestAnimationFrame(() => this.animate());
  }

  boostSteam() {
    for (let i = 0; i < 15; i++) {
      this.spawnParticle();
    }
  }
}

window.SteamCanvas = SteamCanvas;
