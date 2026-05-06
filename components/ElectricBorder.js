const EB_STYLES_ID = 'electric-border-styles';

function injectStyles() {
  if (document.getElementById(EB_STYLES_ID)) return;
  const style = document.createElement('style');
  style.id = EB_STYLES_ID;
  style.textContent = `
    .eb-canvas-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 2;
    }
    .eb-canvas { display: block; }
    .eb-layers {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      z-index: 0;
    }
    .eb-glow-1, .eb-glow-2, .eb-background-glow {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      box-sizing: border-box;
    }
    .eb-glow-1 {
      border: 1.5px solid var(--eb-color, #f472b6);
      opacity: 0.55;
      filter: blur(1px);
    }
    .eb-glow-2 {
      border: 2px solid var(--eb-color, #f472b6);
      opacity: 0.9;
      filter: blur(4px);
    }
    .eb-background-glow {
      z-index: -1;
      transform: scale(1.1);
      filter: blur(32px);
      opacity: 0.18;
      background: linear-gradient(-30deg, var(--eb-color, #f472b6), transparent, var(--eb-color, #f472b6));
    }
  `;
  document.head.appendChild(style);
}

function random(x) {
  return (Math.sin(x * 12.9898) * 43758.5453) % 1;
}

function noise2D(x, y) {
  const i = Math.floor(x), j = Math.floor(y);
  const fx = x - i, fy = y - j;
  const a = random(i + j * 57);
  const b = random(i + 1 + j * 57);
  const c = random(i + (j + 1) * 57);
  const d = random(i + 1 + (j + 1) * 57);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
}

function octavedNoise(x, time, seed, chaos) {
  let y = 0, amp = chaos, freq = 10;
  const octaves = 10, lacunarity = 1.6, gain = 0.7;
  for (let i = 0; i < octaves; i++) {
    y += amp * noise2D(freq * x + seed * 100, time * freq * 0.3);
    freq *= lacunarity;
    amp  *= gain;
  }
  return y;
}

function getCornerPt(cx, cy, r, startA, arcLen, progress) {
  const angle = startA + progress * arcLen;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function getRoundedRectPt(t, l, top, w, h, r) {
  const sw = w - 2 * r, sh = h - 2 * r;
  const ca = (Math.PI * r) / 2;
  const total = 2 * sw + 2 * sh + 4 * ca;
  const dist = t * total;
  let acc = 0;

  if (dist <= acc + sw) return { x: l + r + (dist - acc) / sw * sw, y: top };
  acc += sw;
  if (dist <= acc + ca) return getCornerPt(l + w - r, top + r, r, -Math.PI / 2, Math.PI / 2, (dist - acc) / ca);
  acc += ca;
  if (dist <= acc + sh) return { x: l + w, y: top + r + (dist - acc) / sh * sh };
  acc += sh;
  if (dist <= acc + ca) return getCornerPt(l + w - r, top + h - r, r, 0, Math.PI / 2, (dist - acc) / ca);
  acc += ca;
  if (dist <= acc + sw) return { x: l + w - r - (dist - acc) / sw * sw, y: top + h };
  acc += sw;
  if (dist <= acc + ca) return getCornerPt(l + r, top + h - r, r, Math.PI / 2, Math.PI / 2, (dist - acc) / ca);
  acc += ca;
  if (dist <= acc + sh) return { x: l, y: top + h - r - (dist - acc) / sh * sh };
  acc += sh;
  return getCornerPt(l + r, top + r, r, Math.PI, Math.PI / 2, (dist - acc) / ca);
}

export function initElectricBorder(element, options = {}) {
  injectStyles();

  const {
    color        = '#f472b6',
    speed        = 0.9,
    chaos        = 0.12,
    borderRadius = 6,
  } = options;

  element.style.setProperty('--eb-color', color);
  element.style.isolation = 'isolate';
  element.style.position  = 'relative';

  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'eb-canvas-container';
  const canvas = document.createElement('canvas');
  canvas.className = 'eb-canvas';
  canvasWrap.appendChild(canvas);

  const layers = document.createElement('div');
  layers.className = 'eb-layers';
  layers.innerHTML = `<div class="eb-glow-1"></div><div class="eb-glow-2"></div><div class="eb-background-glow"></div>`;

  element.appendChild(canvasWrap);
  element.appendChild(layers);

  const ctx = canvas.getContext('2d');
  const borderOffset = 60;
  const displacement = 60;
  let timeVal = 0, lastTime = 0, animId;
  let width = 0, height = 0;

  function updateSize() {
    const rect = element.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width  = rect.width  + borderOffset * 2;
    height = rect.height + borderOffset * 2;
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;
    canvas.style.width  = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  updateSize();

  const ro = new ResizeObserver(updateSize);
  ro.observe(element);

  function draw(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    timeVal += dt * speed;
    lastTime = now;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = color;
    ctx.lineWidth   = 1;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    const l = borderOffset, top = borderOffset;
    const bw = width - 2 * borderOffset, bh = height - 2 * borderOffset;
    const r  = Math.min(borderRadius, Math.min(bw, bh) / 2);
    const approxPerim = 2 * (bw + bh) + 2 * Math.PI * r;
    const samples = Math.floor(approxPerim / 2);

    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const progress = i / samples;
      const pt = getRoundedRectPt(progress, l, top, bw, bh, r);
      const xn = octavedNoise(progress * 8, timeVal, 0, chaos);
      const yn = octavedNoise(progress * 8, timeVal, 1, chaos);
      const px = pt.x + xn * displacement;
      const py = pt.y + yn * displacement;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    animId = requestAnimationFrame(draw);
  }

  animId = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(animId);
    ro.disconnect();
    canvasWrap.remove();
    layers.remove();
  };
}
