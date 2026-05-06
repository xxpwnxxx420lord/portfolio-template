const TWO_PI = Math.PI * 2;

export function initDotField(container, options = {}) {
  const cfg = {
    dotRadius:    options.dotRadius    ?? 1.5,
    dotSpacing:   options.dotSpacing   ?? 14,
    cursorRadius: options.cursorRadius ?? 500,
    cursorForce:  options.cursorForce  ?? 0.1,
    bulgeOnly:    options.bulgeOnly    ?? true,
    bulgeStrength:options.bulgeStrength?? 67,
    glowRadius:   options.glowRadius   ?? 180,
    sparkle:      options.sparkle      ?? false,
    waveAmplitude:options.waveAmplitude?? 0,
    gradientFrom: options.gradientFrom ?? 'rgba(244, 114, 182, 0.28)',
    gradientTo:   options.gradientTo   ?? 'rgba(196, 132, 74, 0.16)',
    glowColor:    options.glowColor    ?? '#0c0a09',
  };

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  container.appendChild(canvas);

  const glowId = `dfg-${Math.random().toString(36).slice(2, 9)}`;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';

  const defs = document.createElementNS(svgNS, 'defs');
  const radGrad = document.createElementNS(svgNS, 'radialGradient');
  radGrad.setAttribute('id', glowId);
  const s1 = document.createElementNS(svgNS, 'stop');
  s1.setAttribute('offset', '0%');
  s1.setAttribute('stop-color', cfg.glowColor);
  const s2 = document.createElementNS(svgNS, 'stop');
  s2.setAttribute('offset', '100%');
  s2.setAttribute('stop-color', 'transparent');
  radGrad.appendChild(s1);
  radGrad.appendChild(s2);
  defs.appendChild(radGrad);
  svg.appendChild(defs);

  const glowCircle = document.createElementNS(svgNS, 'circle');
  glowCircle.setAttribute('cx', '-9999');
  glowCircle.setAttribute('cy', '-9999');
  glowCircle.setAttribute('r', cfg.glowRadius);
  glowCircle.setAttribute('fill', `url(#${glowId})`);
  glowCircle.style.cssText = 'opacity:0;will-change:opacity;';
  svg.appendChild(glowCircle);
  container.appendChild(svg);

  const ctx = canvas.getContext('2d', { alpha: true });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let dots = [];
  const sizeRef = { w: 0, h: 0, offsetX: 0, offsetY: 0 };
  const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
  let glowOp = 0;
  let engagement = 0;
  let frameCount = 0;
  let rafId, resizeTimer;

  function buildDots(w, h) {
    const step = cfg.dotRadius + cfg.dotSpacing;
    const cols = Math.floor(w / step);
    const rows = Math.floor(h / step);
    const padX = (w % step) / 2;
    const padY = (h % step) / 2;
    dots = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const ax = padX + col * step + step / 2;
        const ay = padY + row * step + step / 2;
        dots.push({ ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay });
      }
    }
  }

  function doResize() {
    const rect = container.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sizeRef.w = w; sizeRef.h = h;
    sizeRef.offsetX = rect.left + window.scrollX;
    sizeRef.offsetY = rect.top  + window.scrollY;
    buildDots(w, h);
  }

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(doResize, 100);
  }

  function onMouseMove(e) {
    mouse.x = e.pageX - sizeRef.offsetX;
    mouse.y = e.pageY - sizeRef.offsetY;
  }

  const speedInterval = setInterval(() => {
    const dx = mouse.prevX - mouse.x;
    const dy = mouse.prevY - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    mouse.speed += (dist - mouse.speed) * 0.5;
    if (mouse.speed < 0.001) mouse.speed = 0;
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
  }, 20);

  function tick() {
    frameCount++;
    const { w, h } = sizeRef;
    const t = frameCount * 0.02;
    const len = dots.length;

    const targetEng = Math.min(mouse.speed / 5, 1);
    engagement += (targetEng - engagement) * 0.06;
    if (engagement < 0.001) engagement = 0;
    const eng = engagement;

    glowOp += (eng - glowOp) * 0.08;
    glowCircle.setAttribute('cx', mouse.x);
    glowCircle.setAttribute('cy', mouse.y);
    glowCircle.style.opacity = glowOp;

    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, cfg.gradientFrom);
    grad.addColorStop(1, cfg.gradientTo);
    ctx.fillStyle = grad;

    const cr = cfg.cursorRadius, crSq = cr * cr;
    const rad = cfg.dotRadius;
    const isBulge = cfg.bulgeOnly;

    ctx.beginPath();
    for (let i = 0; i < len; i++) {
      const d = dots[i];
      const dx = mouse.x - d.ax;
      const dy = mouse.y - d.ay;
      const distSq = dx * dx + dy * dy;

      if (distSq < crSq && eng > 0.01) {
        const dist = Math.sqrt(distSq);
        if (isBulge) {
          const tt = 1 - dist / cr;
          const push = tt * tt * cfg.bulgeStrength * eng;
          const angle = Math.atan2(dy, dx);
          d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
          d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
        } else {
          const angle = Math.atan2(dy, dx);
          const move = (500 / Math.max(dist, 1)) * (mouse.speed * cfg.cursorForce);
          d.vx += Math.cos(angle) * -move;
          d.vy += Math.sin(angle) * -move;
        }
      } else if (isBulge) {
        d.sx += (d.ax - d.sx) * 0.1;
        d.sy += (d.ay - d.sy) * 0.1;
      }

      if (!isBulge) {
        d.vx *= 0.9; d.vy *= 0.9;
        d.x = d.ax + d.vx; d.y = d.ay + d.vy;
        d.sx += (d.x - d.sx) * 0.1;
        d.sy += (d.y - d.sy) * 0.1;
      }

      let drawX = d.sx, drawY = d.sy;
      if (cfg.waveAmplitude > 0) {
        drawY += Math.sin(d.ax * 0.03 + t) * cfg.waveAmplitude;
        drawX += Math.cos(d.ay * 0.03 + t * 0.7) * cfg.waveAmplitude * 0.5;
      }

      if (cfg.sparkle) {
        const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0;
        const r2 = (hash % 100) < 3 ? rad * 2 : rad;
        ctx.moveTo(drawX + r2, drawY);
        ctx.arc(drawX, drawY, r2, 0, TWO_PI);
      } else {
        ctx.moveTo(drawX + rad, drawY);
        ctx.arc(drawX, drawY, rad, 0, TWO_PI);
      }
    }
    ctx.fill();
    rafId = requestAnimationFrame(tick);
  }

  doResize();
  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    clearInterval(speedInterval);
    clearTimeout(resizeTimer);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onMouseMove);
    canvas.remove();
    svg.remove();
  };
}
