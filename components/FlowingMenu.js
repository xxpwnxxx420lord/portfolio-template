import { gsap } from 'https://esm.sh/gsap@3.12.5';

const css = `
  .flowing-menu-wrap { width: 100%; height: 100%; overflow: hidden; }
  .flowing-menu { display: flex; flex-direction: column; height: 100%; margin: 0; padding: 0; }
  .flowing-menu__item {
    position: relative;
    overflow: hidden;
    flex: 1;
    border-bottom: 1px solid;
  }
  .flowing-menu__item:last-child { border-bottom: none; }
  .flowing-menu__item-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 100%;
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    white-space: nowrap;
    gap: 1rem;
  }
  .flowing-menu__item-link .link-github {
    font-size: 0.6rem;
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0.5;
  }
  .flowing-menu__marquee {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    overflow: hidden;
    pointer-events: none;
    transform: translateY(-101%);
  }
  .flowing-menu__marquee-inner-wrap {
    height: 100%; width: 100%;
    transform: translateY(101%);
  }
  .flowing-menu__marquee-inner {
    display: flex;
    align-items: center;
    height: 100%;
    width: max-content;
  }
  .flowing-menu__marquee-part {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0 1.5rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }
  .flowing-menu__marquee-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.5;
    flex-shrink: 0;
  }
`;

const styleEl = document.createElement('style');
styleEl.textContent = css;
document.head.appendChild(styleEl);

function distMetric(x, y, x2, y2) { return (x - x2) ** 2 + (y - y2) ** 2; }

function findClosestEdge(mx, my, w, h) {
  return distMetric(mx, my, w / 2, 0) < distMetric(mx, my, w / 2, h) ? 'top' : 'bottom';
}

const githubSVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`;

function createMenuItem(item, opts) {
  const { textColor, marqueeBgColor, marqueeTextColor, borderColor, speed } = opts;

  const el = document.createElement('div');
  el.className = 'flowing-menu__item';
  el.style.borderColor = borderColor;

  const link = document.createElement('a');
  link.className = 'flowing-menu__item-link';
  link.href = item.link || '#';
  link.target = '_blank';
  link.rel = 'noopener';
  link.style.color = textColor;

  const nameSpan = document.createElement('span');
  nameSpan.textContent = item.text;

  const ghSpan = document.createElement('span');
  ghSpan.className = 'link-github';
  ghSpan.innerHTML = githubSVG + '<span>GitHub</span>';

  link.appendChild(nameSpan);
  link.appendChild(ghSpan);

  const marquee = document.createElement('div');
  marquee.className = 'flowing-menu__marquee';
  marquee.style.backgroundColor = marqueeBgColor;

  const innerWrap = document.createElement('div');
  innerWrap.className = 'flowing-menu__marquee-inner-wrap';

  const inner = document.createElement('div');
  inner.className = 'flowing-menu__marquee-inner';
  inner.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < 8; i++) {
    const part = document.createElement('div');
    part.className = 'flowing-menu__marquee-part';
    part.style.color = marqueeTextColor;
    const span = document.createElement('span');
    span.textContent = item.text;
    const dot = document.createElement('div');
    dot.className = 'flowing-menu__marquee-dot';
    part.appendChild(span);
    part.appendChild(dot);
    inner.appendChild(part);
  }

  innerWrap.appendChild(inner);
  marquee.appendChild(innerWrap);
  el.appendChild(link);
  el.appendChild(marquee);

  setTimeout(() => {
    const firstPart = inner.querySelector('.flowing-menu__marquee-part');
    if (!firstPart) return;
    const w = firstPart.offsetWidth;
    if (w === 0) return;
    gsap.to(inner, { x: -w, duration: speed, ease: 'none', repeat: -1 });
  }, 80);

  const defaults = { duration: 0.6, ease: 'expo.out' };

  link.addEventListener('mouseenter', (e) => {
    const rect = el.getBoundingClientRect();
    const edge = findClosestEdge(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
    gsap.timeline({ defaults })
      .set(marquee,    { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(innerWrap,  { y: edge === 'top' ? '101%'  : '-101%' }, 0)
      .to([marquee, innerWrap], { y: '0%' }, 0);
  });

  link.addEventListener('mouseleave', (e) => {
    const rect = el.getBoundingClientRect();
    const edge = findClosestEdge(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
    gsap.timeline({ defaults })
      .to(marquee,   { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(innerWrap, { y: edge === 'top' ? '101%'  : '-101%' }, 0);
  });

  return el;
}

export function initFlowingMenu(container, items = [], options = {}) {
  const opts = {
    speed: 12,
    textColor: '#fdf2f8',
    bgColor: '#130f0d',
    marqueeBgColor: '#f472b6',
    marqueeTextColor: '#0c0a09',
    borderColor: '#3a2218',
    ...options,
  };

  container.className = 'flowing-menu-wrap';
  container.style.backgroundColor = opts.bgColor;

  const nav = document.createElement('nav');
  nav.className = 'flowing-menu';
  items.forEach(item => nav.appendChild(createMenuItem(item, opts)));
  container.appendChild(nav);
}
