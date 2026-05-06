const tooltipStyle = `
  @keyframes tooltip-fade-in {
    from { opacity: 0; transform: translateX(-50%) translateY(4px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .vanilla-tooltip {
    position: fixed;
    z-index: 50;
    padding: 3px 8px;
    background: #1a1008;
    border: 1px solid #3a2218;
    border-radius: 5px;
    font-family: monospace;
    font-size: 10px;
    color: #fdf2f8;
    pointer-events: none;
    white-space: nowrap;
    animation: tooltip-fade-in 0.15s ease forwards;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }
`;

const styleEl = document.createElement("style");
styleEl.textContent = tooltipStyle;
document.head.appendChild(styleEl);

export function initTooltip(element) {
  const label = element.getAttribute("data-tooltip");
  if (!label) return;

  let tip = null;

  element.addEventListener("mouseenter", () => {
    tip = document.createElement("div");
    tip.className = "vanilla-tooltip";
    tip.textContent = label;
    document.body.appendChild(tip);

    const rect = element.getBoundingClientRect();
    tip.style.left = `${rect.left + rect.width / 2}px`;
    tip.style.top = `${rect.top - tip.offsetHeight - 8}px`;
  });

  element.addEventListener("mouseleave", () => {
    if (tip) { tip.remove(); tip = null; }
  });
}
