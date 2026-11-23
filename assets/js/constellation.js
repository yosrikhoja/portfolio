import { insideShape } from "./shapes.js";

const PALETTE = ["#8052ff", "#ffb829", "#15846e", "#d14bff", "#4f7cff"];
const POINTER_RADIUS = 90;
const random = (min, max) => min + Math.random() * (max - min);

/**
 * Canvas particle animation. Points either form a shape (data-shape)
 * or, in background mode, drift slowly upward across the viewport.
 */
export class Constellation {
  constructor(canvas, { background = false, reducedMotion = false } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.shape = canvas.dataset.shape;
    this.count = Number(canvas.dataset.count || 300);
    this.background = background;
    this.reducedMotion = reducedMotion;
    this.points = [];
    this.width = 0;
    this.height = 0;
    this.scale = 1;
    this.visible = false;
    this.pointer = { x: -10000, y: -10000 };
    this.lastTime = 0;
    this.frame = 0;

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    this.resize();
    this.makePoints();

    canvas.addEventListener("pointermove", event => this.onPointerMove(event), { passive: true });
    canvas.addEventListener("pointerleave", () => {
      this.pointer.x = -10000;
      this.pointer.y = -10000;
    }, { passive: true });

    if ("IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(entries => {
        this.visible = entries.some(entry => entry.isIntersecting);
        if (this.visible) this.start();
        else this.stop();
      }, { rootMargin: "100px" });
      this.observer.observe(canvas);
    } else {
      this.visible = true;
      this.start();
    }

    window.addEventListener("resize", this.resize, { passive: true });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (this.width === width && this.height === height && this.scale === dpr) return;

    // Keep the layout proportional when the canvas changes size.
    if (this.points.length && this.width && this.height) {
      const sx = width / this.width;
      const sy = height / this.height;
      for (const point of this.points) {
        point.x *= sx; point.y *= sy;
        point.tx *= sx; point.ty *= sy;
      }
    }

    this.width = width;
    this.height = height;
    this.scale = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.points.length) this.draw(0, true);
  }

  makePoints() {
    for (let i = 0; i < this.count; i++) {
      let x, y;
      if (this.background) {
        x = random(0, this.width);
        y = random(0, this.height);
      } else {
        let attempts = 0;
        do {
          x = random(-.92, .92);
          y = random(-.94, .94);
          attempts++;
        } while (!insideShape(this.shape, x, y) && attempts < 120);
        x = this.width / 2 + x * this.width * .42;
        y = this.height / 2 + y * this.height * .44;
      }
      this.points.push({
        x: this.background ? x : random(-this.width, this.width * 2),
        y: this.background ? y : random(-this.height, this.height * 2),
        tx: x, ty: y,
        size: this.background ? random(1, 2.5) : random(1, 4),
        angle: random(0, Math.PI * 2),
        rotation: random(-.004, .004),
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        alpha: this.background ? random(.12, .35) : random(.42, .92),
        delay: this.background ? 0 : random(0, 1)
      });
    }
    if (this.reducedMotion) this.draw(0, true);
  }

  onPointerMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = event.clientX - rect.left;
    this.pointer.y = event.clientY - rect.top;
  }

  start() {
    if (this.reducedMotion) { this.draw(0, true); return; }
    if (!this.frame) this.frame = requestAnimationFrame(this.animate);
  }

  stop() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  updateShapePoint(point, delta, initial) {
    const ease = initial ? 1 : .035;
    point.angle += point.rotation * delta;
    const targetX = point.tx + Math.sin((point.angle + point.delay) * .55) * 1.3;
    const targetY = point.ty + Math.cos((point.angle + point.delay) * .43) * 1.3;
    point.x += (targetX - point.x) * ease;
    point.y += (targetY - point.y) * ease;

    const dx = point.x - this.pointer.x;
    const dy = point.y - this.pointer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0 && distance < POINTER_RADIUS) {
      const force = (POINTER_RADIUS - distance) / POINTER_RADIUS;
      point.x += (dx / distance) * force * 3.3;
      point.y += (dy / distance) * force * 3.3;
    }
  }

  updateBackgroundPoint(point, delta) {
    point.y -= .06 * delta;
    point.x += Math.sin((point.y + point.tx) * .005) * .025 * delta;
    if (point.y < -10) {
      point.y = this.height + 10;
      point.x = random(0, this.width);
    }
  }

  drawTriangle(point) {
    const { ctx } = this;
    const s = point.size;
    const cos = Math.cos(point.angle);
    const sin = Math.sin(point.angle);
    const verts = [[0, -s], [s * .86, s * .68], [-s * .86, s * .68]];
    ctx.beginPath();
    verts.forEach(([vx, vy], index) => {
      const px = point.x + vx * cos - vy * sin;
      const py = point.y + vx * sin + vy * cos;
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.globalAlpha = point.alpha;
    ctx.strokeStyle = point.color;
    ctx.lineWidth = this.background ? .65 : 1;
    ctx.stroke();
  }

  draw(delta, initial = false) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (const point of this.points) {
      if (this.background) this.updateBackgroundPoint(point, delta);
      else this.updateShapePoint(point, delta, initial);
      this.drawTriangle(point);
    }
    this.ctx.globalAlpha = 1;
  }

  animate(time) {
    if (!this.visible || document.hidden) { this.frame = 0; return; }
    const delta = this.lastTime ? Math.min((time - this.lastTime) / 16.67, 2.5) : 1;
    this.lastTime = time;
    this.draw(delta);
    this.frame = requestAnimationFrame(this.animate);
  }
}

/** Creates every constellation on the page and pauses them while the tab is hidden. */
export function initConstellations({ reducedMotion }) {
  const instances = [...document.querySelectorAll(".particle-canvas")]
    .map(canvas => new Constellation(canvas, { reducedMotion }));

  const ambientCanvas = document.getElementById("ambient-canvas");
  if (ambientCanvas) {
    instances.push(new Constellation(ambientCanvas, { background: true, reducedMotion }));
  }

  document.addEventListener("visibilitychange", () => {
    instances.forEach(item => {
      if (document.hidden) item.stop();
      else if (item.visible) item.start();
    });
  });
}
