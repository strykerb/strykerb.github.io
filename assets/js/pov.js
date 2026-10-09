/*
  Persistence-of-vision poi simulation.

  A poi's LED strip shows one column of a W x H image at a time. As the poi
  turns, each column is drawn at the angle the strip has reached, so columns
  map to angles and rows map to distance from the hand. Each column fades
  out over `tau` seconds, standing in for the eye's persistence of vision.
*/
(function () {
  "use strict";

  var W = 48, H = 14;
  var TAU = Math.PI * 2;
  var START = -Math.PI / 2; // column 0 starts at 12 o'clock

  // Pattern generators. Row 0 is the tip of the poi, row H-1 is nearest the hand.
  var PATTERNS = {
    hook: function (x, y) {
      var d = H - 1 - y;
      var t = ((x + d * 0.85) % 12 + 12) % 12;
      var arm = t < 3.2 ? 1 : 0;
      var barb = d > 8 && t >= 3.2 && t < 5 ? 0.55 : 0;
      return Math.max(arm, barb);
    },
    flame: function (x, y) {
      var d = H - 1 - y;
      var h = H * (0.38 + 0.34 * Math.abs(Math.sin(x * 0.4)) + 0.18 * Math.sin(x * 1.37 + 1));
      if (d > h) return 0;
      return 0.35 + 0.65 * (1 - d / h);
    },
    orbit: function (x, y) {
      if (y === 0 || y === H - 1) return x % 2 ? 0.45 : 0;
      var cx = (x % 12) - 6, cy = y - 6.5 + 2.5 * Math.sin((x / W) * TAU * 2);
      var r = Math.sqrt(cx * cx + cy * cy);
      return r < 2.3 ? 1 : r < 3.1 ? 0.3 : 0;
    }
  };
  var ORDER = ["hook", "flame", "orbit"];

  function buildPattern(name) {
    var fn = PATTERNS[name] || PATTERNS.hook;
    var data = new Float32Array(W * H);
    for (var x = 0; x < W; x++) for (var y = 0; y < H; y++) data[y * W + x] = fn(x, y);
    return data;
  }

  function cssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function POV(canvas, opts) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.speed = opts.speed;          // revolutions per second
    this.targetSpeed = opts.speed;
    this.tau = opts.tau;              // fade time constant, seconds
    this.cycle = opts.cycle || 0;     // seconds between automatic pattern changes, 0 = never
    this.onFrame = opts.onFrame || null;
    this.angle = 0;                   // revolutions, unbounded
    this.time = 0;
    this.lit = new Float64Array(W).fill(-1e9);
    this.patternIndex = 0;
    this.setPattern(opts.pattern || "hook");
    this.colors = {
      accent: cssVar("--accent", "#87b894"),
      line: cssVar("--line", "#292e2a"),
      text: cssVar("--text", "#e9ebe7"),
      muted: cssVar("--text-3", "#6f766f")
    };
    this.visible = false;
    this.running = false;
    this.last = 0;
    this._tick = this.tick.bind(this);

    var self = this;
    this.resize();
    if ("ResizeObserver" in window) new ResizeObserver(function () { self.resize(); self.draw(); }).observe(canvas);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        self.visible = entries[0].isIntersecting;
        self.update();
      }).observe(canvas);
    } else {
      this.visible = true;
    }
    document.addEventListener("visibilitychange", function () { self.update(); });
    reduceMotion.addEventListener && reduceMotion.addEventListener("change", function () { self.update(); });
    this.update();
  }

  POV.prototype.setPattern = function (name) {
    this.pattern = name;
    this.patternIndex = Math.max(0, ORDER.indexOf(name));
    this.data = buildPattern(name);
    if (!this.running) this.draw();
  };

  POV.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var size = this.canvas.clientWidth;
    if (!size) return;
    this.canvas.width = Math.round(size * dpr);
    this.canvas.height = Math.round(size * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.size = size;
  };

  POV.prototype.isStatic = function () { return reduceMotion.matches; };

  POV.prototype.update = function () {
    var shouldRun = this.visible && !document.hidden && !this.isStatic();
    if (shouldRun && !this.running) {
      this.running = true;
      this.last = performance.now();
      requestAnimationFrame(this._tick);
    } else if (!shouldRun) {
      this.running = false;
      this.draw();
    }
  };

  POV.prototype.tick = function (now) {
    if (!this.running) return;
    var dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.step(dt);
    this.draw();
    requestAnimationFrame(this._tick);
  };

  POV.prototype.step = function (dt) {
    this.speed += (this.targetSpeed - this.speed) * (1 - Math.exp(-dt * 3));
    var prev = this.angle;
    var next = prev + this.speed * dt;
    var t0 = this.time;
    this.time += dt;

    // Every column the strip left this frame starts fading from the moment it was left;
    // the column it's on now stays fully lit.
    var c0 = Math.floor(prev * W), c1 = Math.floor(next * W);
    if (c1 - c0 >= W) c0 = c1 - W + 1;
    for (var c = c0; c < c1; c++) {
      var frac = Math.min(1, Math.max(0, ((c + 1) / W - prev) / (next - prev)));
      this.lit[((c % W) + W) % W] = t0 + frac * dt;
    }
    this.lit[((c1 % W) + W) % W] = this.time;
    this.angle = next;

    // Swap patterns at the top of a revolution, like a show change.
    if (this.cycle && Math.floor(next) !== Math.floor(prev) && this.time - (this.lastSwap || 0) > this.cycle) {
      this.lastSwap = this.time;
      this.patternIndex = (this.patternIndex + 1) % ORDER.length;
      this.pattern = ORDER[this.patternIndex];
      this.data = buildPattern(this.pattern);
    }
  };

  POV.prototype.currentColumn = function () {
    return ((Math.floor(this.angle * W) % W) + W) % W;
  };

  POV.prototype.draw = function () {
    var ctx = this.ctx, s = this.size;
    if (!s) return;
    var cx = s / 2, cy = s / 2;
    var R = s * 0.46, r0 = s * 0.16;
    var ring = (R - r0) / H;
    var dTheta = TAU / W;
    var still = !this.running && this.isStatic();

    ctx.clearRect(0, 0, s, s);

    // Guide circles
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.colors.line;
    ctx.beginPath(); ctx.arc(cx, cy, R + ring * 0.6, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r0 - ring * 0.4, 0, TAU); ctx.stroke();

    // Lit columns
    ctx.strokeStyle = this.colors.accent;
    ctx.lineWidth = ring * 0.72;
    ctx.lineCap = "butt";
    for (var c = 0; c < W; c++) {
      var intensity = still ? 1 : Math.exp(-(this.time - this.lit[c]) / this.tau);
      if (intensity < 0.015) continue;
      var a0 = START + c * dTheta + dTheta * 0.08;
      var a1 = a0 + dTheta * 0.84;
      for (var y = 0; y < H; y++) {
        var v = this.data[y * W + c];
        if (v <= 0.01) continue;
        var r = r0 + (H - 1 - y + 0.5) * ring;
        ctx.globalAlpha = intensity * v;
        ctx.beginPath();
        ctx.arc(cx, cy, r, a0, a1);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    if (still) return;

    // The poi itself: tether from the hand to the head, with the current column on the LEDs.
    var col = this.currentColumn();
    var ang = START + (this.angle % 1) * TAU;
    var ca = Math.cos(ang), sa = Math.sin(ang);
    ctx.strokeStyle = this.colors.muted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + ca * (R + ring), cy + sa * (R + ring));
    ctx.stroke();
    for (var yy = 0; yy < H; yy++) {
      var vv = this.data[yy * W + col];
      var rr = r0 + (H - 1 - yy + 0.5) * ring;
      ctx.fillStyle = vv > 0.01 ? this.colors.text : this.colors.line;
      ctx.globalAlpha = vv > 0.01 ? 0.4 + 0.6 * vv : 1;
      ctx.beginPath();
      ctx.arc(cx + ca * rr, cy + sa * rr, Math.max(1.2, ring * 0.2), 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.colors.muted;
    ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, TAU); ctx.fill();

    if (this.onFrame) this.onFrame(this);
  };

  // Draws the flat source image with the column currently on the LEDs highlighted.
  function drawSource(canvas, pov) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var cw = w / W, ch = h / H, gap = Math.max(1, cw * 0.12);
    var col = pov.running ? pov.currentColumn() : -1;
    for (var x = 0; x < W; x++) {
      for (var y = 0; y < H; y++) {
        var v = pov.data[y * W + x];
        ctx.fillStyle = v > 0.01 ? pov.colors.accent : pov.colors.line;
        ctx.globalAlpha = v > 0.01 ? (x === col ? 1 : 0.25 + 0.6 * v) : (x === col ? 0.9 : 0.35);
        ctx.fillRect(x * cw + gap / 2, y * ch + gap / 2, cw - gap, ch - gap);
      }
    }
    ctx.globalAlpha = 1;
    if (col >= 0) {
      ctx.strokeStyle = pov.colors.text;
      ctx.lineWidth = 1;
      ctx.strokeRect(col * cw + 0.5, 0.5, cw - 1, h - 1);
    }
  }

  function init() {
    var hero = document.querySelector('[data-pov="hero"]');
    if (hero) {
      var heroPov = new POV(hero, { speed: 1.1, tau: 0.75, pattern: "hook", cycle: 7 });
      hero.addEventListener("pointerenter", function () { heroPov.targetSpeed = 3.2; });
      hero.addEventListener("pointerleave", function () { heroPov.targetSpeed = 1.1; });
    }

    var demo = document.querySelector("[data-pov-demo]");
    if (!demo) return;
    var source = demo.querySelector("[data-pov-source]");
    var colLabel = demo.querySelector("[data-pov-col]");
    var speedIn = demo.querySelector("[data-pov-speed]");
    var speedOut = demo.querySelector("[data-pov-speed-out]");
    var lastCol = -1;

    var pov = new POV(demo.querySelector('[data-pov="demo"]'), {
      speed: parseFloat(speedIn.value), tau: 0.35, pattern: "hook",
      onFrame: function (p) {
        drawSource(source, p);
        var c = p.currentColumn();
        if (c !== lastCol) { lastCol = c; colLabel.textContent = "col " + (c + 1) + " / " + W; }
      }
    });
    drawSource(source, pov);
    if (pov.isStatic()) colLabel.textContent = W + " columns";

    speedIn.addEventListener("input", function () {
      var v = parseFloat(speedIn.value);
      pov.targetSpeed = v;
      speedOut.textContent = v.toFixed(v < 1 ? 2 : 1) + " rev/s";
    });

    demo.querySelectorAll("[data-pov-pattern]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        demo.querySelectorAll("[data-pov-pattern]").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        pov.setPattern(btn.getAttribute("data-pov-pattern"));
        drawSource(source, pov);
      });
    });

    if ("ResizeObserver" in window) new ResizeObserver(function () { drawSource(source, pov); }).observe(source);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
