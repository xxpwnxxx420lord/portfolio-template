(function() {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spotlight-fade {
      0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
    }
  `;
  document.head.appendChild(style);

  window.initSpotlightCard = function(element, options = {}) {
    const config = {
      spotlightColor: options.spotlightColor || "rgba(167, 139, 250, 0.15)",
      borderColor: options.borderColor || "rgba(167, 139, 250, 0.3)",
    };

    Object.assign(element.style, {
      position: "relative",
      overflow: "hidden",
      borderRadius: "12px",
      backgroundColor: "#111",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      transition: "all 0.3s ease",
      cursor: "default"
    });

    const spotlight = document.createElement("div");
    Object.assign(spotlight.style, {
      position: "absolute",
      inset: "-1px",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity 0.3s ease",
      zIndex: "1"
    });
    element.appendChild(spotlight);

    const contentNodes = Array.from(element.childNodes).filter(node => node !== spotlight);
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.zIndex = "10";
    contentNodes.forEach(node => wrapper.appendChild(node));
    element.appendChild(wrapper);

    element.addEventListener("mousemove", (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spotlight.style.background = `radial-gradient(600px circle at ${x}px ${y}px, ${config.spotlightColor}, transparent 40%)`;
    });

    element.addEventListener("mouseenter", () => {
      spotlight.style.opacity = "1";
      element.style.borderColor = config.borderColor;
      element.style.transform = "translateY(-2px)";
      element.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.3)";
    });

    element.addEventListener("mouseleave", () => {
      spotlight.style.opacity = "0";
      element.style.borderColor = "rgba(255, 255, 255, 0.1)";
      element.style.transform = "translateY(0px)";
      element.style.boxShadow = "none";
    });
  };

  window.initMultiSpotlight = function(container) {
    Object.assign(container.style, {
      position: "relative",
      overflow: "hidden",
      backgroundColor: "#000",
      minHeight: "200px"
    });

    container.addEventListener("mousemove", (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const spot = document.createElement("div");
      Object.assign(spot.style, {
        position: "absolute",
        pointerEvents: "none",
        left: `${x}px`,
        top: `${y}px`,
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 70%)",
        transform: "translate(-50%, -50%)",
        animation: "spotlight-fade 1.5s ease-out forwards",
        zIndex: "1"
      });

      container.appendChild(spot);

      setTimeout(() => spot.remove(), 1500);

      const activeSpots = container.querySelectorAll('[style*="spotlight-fade"]');
      if (activeSpots.length > 10) activeSpots[0].remove();
    });
  };
})();
