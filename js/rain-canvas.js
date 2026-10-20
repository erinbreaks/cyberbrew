/**
 * ==========================================================================
 * CYBERBREW — WINDOW RAIN & WEATHER CANVAS
 * Organic Rain Droplets, Condensation Trickles & Falling Snowflakes
 * ==========================================================================
 */

class WeatherCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.drops = [];
    this.staticDrops = [];
    this.snowflakes = [];
    this.currentWeather = 'rainy';
    this.isRunning = true;

    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    this.initDrops();
    this.animate();
  }

  resize() {
    this.width = this.canvas.parentElement.clientWidth;
    this.height = this.canvas.parentElement.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  setWeather(weather) {
    this.currentWeather = weather;
    this.drops = [];
    this.staticDrops = [];
    this.snowflakes = [];
    this.initDrops();
  }

  initDrops() {
    if (this.currentWeather === 'rainy') {
      // Create static condensation drops on the glass
      for (let i = 0; i < 45; i++) {
        this.staticDrops.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: 1.2 + Math.random() * 2.2,
          alpha: 0.3 + Math.random() * 0.4
        });
      }

      // Moving sliding drops
      for (let i = 0; i < 22; i++) {
        this.spawnMovingDrop();
      }
    } else if (this.currentWeather === 'snowy') {
      for (let i = 0; i < 60; i++) {
        this.snowflakes.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: 1 + Math.random() * 2.5,
          speedY: 0.5 + Math.random() * 1.2,
          speedX: (Math.random() - 0.5) * 0.5,
          alpha: 0.4 + Math.random() * 0.5
        });
      }
    } else if (this.currentWeather === 'sunny') {
      // Floating dust motes in sunbeams
      for (let i = 0; i < 25; i++) {
        this.snowflakes.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: 0.8 + Math.random() * 1.4,
          speedY: -0.2 - Math.random() * 0.3,
          speedX: (Math.random() - 0.5) * 0.3,
          alpha: 0.2 + Math.random() * 0.35
        });
      }
    }
  }

  spawnMovingDrop() {
    this.drops.push({
      x: Math.random() * this.width,
      y: -10 - Math.random() * 100,
      radius: 1.8 + Math.random() * 2.8,
      speed: 1.5 + Math.random() * 3.2,
      trail: [],
      alpha: 0.5 + Math.random() * 0.35
    });
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.currentWeather === 'rainy' || this.currentWeather === 'cloudy') {
      this.drawRain();
    } else if (this.currentWeather === 'snowy' || this.currentWeather === 'sunny') {
      this.drawParticles();
    }

    requestAnimationFrame(() => this.animate());
  }

  drawRain() {
    // Draw static condensation beads
    this.staticDrops.forEach(d => {
      this.ctx.beginPath();
      this.ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(243, 235, 221, ${d.alpha * 0.4})`;
      this.ctx.fill();

      // Soft highlight
      this.ctx.beginPath();
      this.ctx.arc(d.x - d.radius * 0.3, d.y - d.radius * 0.3, d.radius * 0.35, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha * 0.6})`;
      this.ctx.fill();
    });

    // Draw sliding drops and moisture trail
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      drop.y += drop.speed;

      // Add to trail
      if (Math.random() < 0.35) {
        drop.trail.push({ x: drop.x + (Math.random() - 0.5) * 1.5, y: drop.y, r: drop.radius * 0.6, a: 0.3 });
      }

      // Draw trail beads
      drop.trail.forEach(t => {
        this.ctx.beginPath();
        this.ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(243, 235, 221, ${t.a * 0.3})`;
        this.ctx.fill();
      });

      // Draw main sliding bead
      this.ctx.beginPath();
      this.ctx.ellipse(drop.x, drop.y, drop.radius, drop.radius * 1.4, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(243, 235, 221, ${drop.alpha * 0.6})`;
      this.ctx.fill();

      // Specular highlight
      this.ctx.beginPath();
      this.ctx.arc(drop.x - drop.radius * 0.3, drop.y - drop.radius * 0.4, drop.radius * 0.35, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.fill();

      // Reset when off bottom
      if (drop.y > this.height + 20) {
        this.drops.splice(i, 1);
        this.spawnMovingDrop();
      }
    }
  }

  drawParticles() {
    this.snowflakes.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;

      if (p.y > this.height) p.y = -5;
      if (p.y < -5) p.y = this.height;
      if (p.x > this.width) p.x = 0;
      if (p.x < 0) p.x = this.width;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(243, 235, 221, ${p.alpha})`;
      this.ctx.fill();
    });
  }
}

window.WeatherCanvas = WeatherCanvas;
