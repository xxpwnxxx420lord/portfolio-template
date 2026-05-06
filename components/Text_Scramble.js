const chars = "!<>-_\\/[]{}—=+*^?#________";

export function createTextScramble(element, options = {}) {
  const text = options.text || element.textContent;
  const duration = options.duration ?? 2000;
  const delay = options.delay ?? 0;

  let hasAnimated = false;

  function scramble() {
    if (hasAnimated) return;

    const length = text.length;
    const frameRate = 1000 / 30;
    const totalFrames = Math.floor(duration / frameRate);
    let frame = 0;

    const queue = text.split("").map(() => ({
      from: chars[Math.floor(Math.random() * chars.length)],
      start: Math.floor(Math.random() * totalFrames * 0.5),
      end: Math.floor(Math.random() * totalFrames * 0.5) + Math.floor(totalFrames * 0.5),
    }));

    function update() {
      let output = "";
      let complete = 0;

      for (let i = 0; i < length; i++) {
        const { from, start, end } = queue[i];
        let char = from;

        if (frame >= end) {
          char = text[i];
          complete++;
        } else if (frame >= start) {
          char = Math.random() < 0.28
            ? chars[Math.floor(Math.random() * chars.length)]
            : from;
        }

        output += char;
      }

      element.textContent = output;

      if (complete === length) {
        hasAnimated = true;
        return;
      }

      frame++;
      setTimeout(update, frameRate);
    }

    setTimeout(update, delay);
  }

  scramble();
  return { scramble };
}

export function enableHoverScramble(element) {
  const text = element.textContent;
  let isScrambling = false;

  function scramble() {
    if (isScrambling) return;
    isScrambling = true;

    const length = text.length;
    const duration = 800;
    const frameRate = 1000 / 30;
    const totalFrames = Math.floor(duration / frameRate);
    let frame = 0;

    const queue = text.split("").map(() => ({
      from: chars[Math.floor(Math.random() * chars.length)],
      start: Math.floor(Math.random() * totalFrames * 0.3),
      end: Math.floor(Math.random() * totalFrames * 0.3) + Math.floor(totalFrames * 0.7),
    }));

    function update() {
      let output = "";
      let complete = 0;

      for (let i = 0; i < length; i++) {
        const { from, start, end } = queue[i];
        let char = from;

        if (frame >= end) {
          char = text[i];
          complete++;
        } else if (frame >= start) {
          char = Math.random() < 0.28
            ? chars[Math.floor(Math.random() * chars.length)]
            : from;
        }

        output += char;
      }

      element.textContent = output;

      if (complete === length) {
        isScrambling = false;
        return;
      }

      frame++;
      setTimeout(update, frameRate);
    }

    update();
  }

  function reset() {
    element.textContent = text;
    isScrambling = false;
  }

  element.addEventListener("mouseenter", scramble);
  element.addEventListener("mouseleave", reset);

  return () => {
    element.removeEventListener("mouseenter", scramble);
    element.removeEventListener("mouseleave", reset);
  };
}
