let matrixInitialized = false;

function initMatrixBackground() {
  if (matrixInitialized) {
    return;
  }
  matrixInitialized = true;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const canvas = document.getElementById("matrix-bg");
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");

  const fontSize = 14;
  const words = ["01Edu", "01Founders"];
  ctx.font = fontSize + "px monospace";
  const columnWidth =
    Math.max(...words.map((w) => ctx.measureText(w).width)) + 16;

  let columns = 0;
  let drops = [];

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const newColumns = Math.max(1, Math.floor(canvas.width / columnWidth));
    if (newColumns !== columns) {
      const newDrops = new Array(newColumns).fill(1);
      for (let i = 0; i < Math.min(columns, newColumns); i++) {
        newDrops[i] = drops[i];
      }
      columns = newColumns;
      drops = newDrops;
    }
  }
  resize();
  window.addEventListener("resize", resize);

  const resizeObserver = new ResizeObserver(() => {
    resize();
  });
  resizeObserver.observe(canvas);

  function draw() {
    ctx.fillStyle = "rgba(13, 17, 23, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00f2fe";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const word = words[Math.random() > 0.5 ? 0 : 1];
      const x = i * columnWidth;
      const y = drops[i] * fontSize;
      ctx.fillText(word, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 60);
}
