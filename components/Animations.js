// TiltCard — 3D tilt + glare effect on hover
export function initTiltCard(element, options = {}) {
  const tiltAmount = options.tiltAmount ?? 10;
  const glareOpacity = options.glareOpacity ?? 0.15;
  const scale = options.scale ?? 1.02;

  element.style.transition = "transform 0.2s ease-out";
  element.style.willChange = "transform";

  const glare = document.createElement("div");
  Object.assign(glare.style, {
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
    opacity: "0",
    transition: "opacity 0.3s ease",
    zIndex: "1",
    borderRadius: "inherit",
  });
  element.appendChild(glare);

  element.addEventListener("mouseenter", () => {
    glare.style.opacity = glareOpacity;
  });

  element.addEventListener("mousemove", (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -tiltAmount;
    const rotateY = ((x - centerX) / centerX) * tiltAmount;

    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;

    const gx = (x / rect.width) * 100;
    const gy = (y / rect.height) * 100;
    glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.18) 0%, transparent 60%)`;
  });

  element.addEventListener("mouseleave", () => {
    element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    glare.style.opacity = "0";
  });
}

// Floating — gentle up/down float animation
export function initFloating(element, options = {}) {
  const duration = options.duration ?? 3;
  const distance = options.distance ?? 8;
  const delay = options.delay ?? 0;

  const keyframes = `
    @keyframes floating-${distance} {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-${distance}px); }
    }
  `;

  if (!document.querySelector(`#floating-style-${distance}`)) {
    const style = document.createElement("style");
    style.id = `floating-style-${distance}`;
    style.textContent = keyframes;
    document.head.appendChild(style);
  }

  element.style.animation = `floating-${distance} ${duration}s ease-in-out infinite`;
  element.style.animationDelay = `${delay}s`;
  element.style.willChange = "transform";
}

// StaggerItem — fade + slide up on scroll into view
export function initStaggerItems(elements, options = {}) {
  const staggerDelay = options.staggerDelay ?? 0.1;

  elements.forEach((el, i) => {
    Object.assign(el.style, {
      opacity: "0",
      transform: "translateY(16px)",
      transition: `opacity 0.5s ease, transform 0.5s ease`,
      transitionDelay: `${i * staggerDelay}s`,
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach((el) => observer.observe(el));
}
