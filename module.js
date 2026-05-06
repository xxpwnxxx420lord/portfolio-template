import { createTextScramble } from "./components/Text_Scramble.js";
import { initTiltCard, initFloating, initStaggerItems } from "./components/Animations.js";
import { initTooltip } from "./components/Tooltip.js";
import { initDotField } from "./components/DotField.js";
import { initElectricBorder } from "./components/ElectricBorder.js";
import { initFlowingMenu } from "./components/FlowingMenu.js";
import { initContextMenu } from "./components/ContextMenu.js";

const projects = [
  { text: "Project Alpha", link: "#" },
  { text: "Project Beta",  link: "#" },
  { text: "Project Gamma", link: "#" },
];

document.addEventListener("DOMContentLoaded", () => {
  const bg = document.getElementById("aurora-bg");
  if (bg) {
    initDotField(bg, {
      dotRadius:     1.5,
      dotSpacing:    20,
      bulgeStrength: 80,
      glowRadius:    220,
      sparkle:       false,
      waveAmplitude: 0,
      gradientFrom:  "rgba(244, 114, 182, 0.55)",
      gradientTo:    "rgba(196, 132, 74, 0.38)",
      glowColor:     "#0c0a09",
    });
  }

  const projectsMenu = document.getElementById("projects-menu");
  if (projectsMenu) {
    initFlowingMenu(projectsMenu, projects, {
      speed:            12,
      textColor:        "#fdf2f8",
      bgColor:          "#130f0d",
      marqueeBgColor:   "#f472b6",
      marqueeTextColor: "#0c0a09",
      borderColor:      "#3a2218",
    });
  }

  const authorElement = document.getElementById("Author");
  if (authorElement) {
    createTextScramble(authorElement, { duration: 1500, delay: 300 });
    initFloating(authorElement, { duration: 4, distance: 5, delay: 0 });
  }

  const cards = Array.from(document.querySelectorAll(".spotlight-card"));
  initStaggerItems(cards, { staggerDelay: 0.1 });

  document.querySelectorAll("[data-tooltip]").forEach(el => initTooltip(el));

  initContextMenu();

  cards.forEach(card => {
    initElectricBorder(card, {
      color:        "#f472b6",
      speed:        0.8,
      chaos:        0.11,
      borderRadius: 6,
    });

    const glow = document.createElement("div");
    glow.className = "glow-layer";
    card.appendChild(glow);

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      glow.style.opacity = "1";
      glow.style.background = `radial-gradient(circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, var(--accent-glow), transparent 70%)`;
    });
    card.addEventListener("mouseleave", () => { glow.style.opacity = "0"; });

    initTiltCard(card, { tiltAmount: 18, glareOpacity: 0.22, scale: 1.05 });
  });
});
