const style = document.createElement("style");
style.textContent = `
  #ctx-menu {
    position: fixed;
    z-index: 9999;
    min-width: 172px;
    background: #130f0d;
    border: 1px solid #3a2218;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(244,114,182,0.08);
    font-family: 'Inter', monospace, sans-serif;
    font-size: 12px;
    color: #fdf2f8;
    opacity: 0;
    transform: scale(0.94) translateY(-4px);
    transform-origin: top left;
    transition: opacity 0.12s ease, transform 0.12s ease;
    pointer-events: none;
    user-select: none;
  }
  #ctx-menu.ctx-visible {
    opacity: 1;
    transform: scale(1) translateY(0);
    pointer-events: all;
  }
  .ctx-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    border-radius: 5px;
    cursor: pointer;
    color: #fdf2f8;
    transition: background 0.1s, color 0.1s;
    white-space: nowrap;
  }
  .ctx-item:hover {
    background: rgba(244,114,182,0.12);
    color: #f472b6;
  }
  .ctx-item:hover .ctx-icon {
    color: #f472b6;
  }
  .ctx-item:active {
    background: rgba(244,114,182,0.22);
  }
  .ctx-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: #c4844a;
    transition: color 0.1s;
  }
  .ctx-sep {
    height: 1px;
    background: #3a2218;
    margin: 4px 6px;
  }
  .ctx-label {
    flex: 1;
    letter-spacing: 0.01em;
  }
  .ctx-hint {
    font-size: 10px;
    color: #6b5248;
    letter-spacing: 0.05em;
  }
  .ctx-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px 5px;
    border-radius: 5px;
    opacity: 0.45;
    font-size: 10px;
    color: #c4844a;
    letter-spacing: 0.06em;
    cursor: default;
  }
  .ctx-footer .ctx-icon { color: #c4844a; }
`;
document.head.appendChild(style);

const icons = {
  top: `<svg class="ctx-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 12V4M4 7l4-4 4 4"/><line x1="3" y1="3" x2="13" y2="3"/></svg>`,
  copy: `<svg class="ctx-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="5" width="8" height="9" rx="1.5"/><path d="M3 11V3a1 1 0 011-1h8"/></svg>`,
  source: `<svg class="ctx-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="5 4 1 8 5 12"/><polyline points="11 4 15 8 11 12"/><line x1="9" y1="3" x2="7" y2="13"/></svg>`,
  reload: `<svg class="ctx-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13.5 8A5.5 5.5 0 112.9 5"/><polyline points="2 2 2.9 5 6 4"/></svg>`,
  spark: `<svg class="ctx-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.6 4.4H14l-3.6 2.6 1.4 4.4L8 9.8l-3.8 2.6 1.4-4.4L2 5.4h4.4z"/></svg>`,
};

const menuItems = [
  {
    icon: icons.top,
    label: "Back to Top",
    hint: null,
    action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
  },
  {
    icon: icons.copy,
    label: "Copy Link",
    hint: null,
    action: () => {
      navigator.clipboard?.writeText(window.location.href).catch(() => {});
      flashFeedback("Copied!");
    },
  },
  {
    icon: icons.source,
    label: "View Source",
    hint: null,
    action: () => window.open("view-source:" + window.location.href, "_blank"),
  },
  {
    icon: icons.reload,
    label: "Reload",
    hint: null,
    action: () => window.location.reload(),
  },
];

let feedbackTimeout = null;
function flashFeedback(msg) {
  const el = document.getElementById("ctx-feedback");
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = "1";
  clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(() => { el.style.opacity = "0"; }, 1200);
}

function buildMenu() {
  const menu = document.createElement("div");
  menu.id = "ctx-menu";
  menu.setAttribute("role", "menu");

  menuItems.forEach(item => {
    const row = document.createElement("div");
    row.className = "ctx-item";
    row.setAttribute("role", "menuitem");
    row.innerHTML = `${item.icon}<span class="ctx-label">${item.label}</span>${item.hint ? `<span class="ctx-hint">${item.hint}</span>` : ""}`;
    row.addEventListener("mousedown", e => {
      e.preventDefault();
      hide();
      item.action();
    });
    menu.appendChild(row);
  });

  const sep = document.createElement("div");
  sep.className = "ctx-sep";
  menu.appendChild(sep);

  const footer = document.createElement("div");
  footer.className = "ctx-footer";
  footer.innerHTML = `${icons.spark}<span>vanilla js</span>`;
  menu.appendChild(footer);

  document.body.appendChild(menu);
  return menu;
}

let menu = null;

function show(x, y) {
  if (!menu) menu = buildMenu();
  menu.style.left = "0px";
  menu.style.top  = "0px";
  menu.classList.remove("ctx-visible");
  document.body.appendChild(menu);

  requestAnimationFrame(() => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const mw = menu.offsetWidth, mh = menu.offsetHeight;
    const finalX = x + mw > vw ? x - mw : x;
    const finalY = y + mh > vh ? y - mh : y;
    menu.style.left = `${finalX}px`;
    menu.style.top  = `${finalY}px`;
    menu.style.transformOrigin = finalX < x ? "top right" : "top left";
    menu.classList.add("ctx-visible");
  });
}

function hide() {
  if (!menu) return;
  menu.classList.remove("ctx-visible");
}

export function initContextMenu() {
  document.addEventListener("contextmenu", e => {
    e.preventDefault();
    show(e.clientX + 2, e.clientY + 2);
  });

  document.addEventListener("mousedown", e => {
    if (menu && !menu.contains(e.target)) hide();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") hide();
  });

  window.addEventListener("scroll", hide, { passive: true });
  window.addEventListener("blur", hide);
}
