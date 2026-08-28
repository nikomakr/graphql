function formatXp(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + "M";
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + "k";
  }
  return String(Math.round(value));
}

function positionTooltipSmart(tooltip, wrapRect, clientX, clientY) {
  const midpoint = wrapRect.left + wrapRect.width / 2;
  if (clientX < midpoint) {
    tooltip.style.left = `${clientX - wrapRect.left + 12}px`;
    tooltip.style.right = "auto";
  } else {
    tooltip.style.right = `${wrapRect.right - clientX + 12}px`;
    tooltip.style.left = "auto";
  }
  tooltip.style.top = `${clientY - wrapRect.top + 12}px`;
}

function formatKb(amount) {
  return Math.round(amount / 1000) + " kB";
}

function formatDateLabel(dateInput) {
  const d = new Date(dateInput);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function renderXpChart() {
  const [result, startResult] = await Promise.all([
    getXpTransactions(),
    getFellowshipStartDate(),
  ]);

  if (!result.success || result.data.length === 0) {
    return;
  }
  if (!startResult.success) {
    return;
  }

  const rows = result.data;

  const startDate = new Date(startResult.date);
  const endDate = new Date();

  const leftMargin = 44;
  const rightMargin = 10;
  const topMargin = 14;
  const bottomMargin = 30;
  const svgWidth = 600;
  const svgHeight = 240;
  const plotWidth = svgWidth - leftMargin - rightMargin;
  const plotHeight = svgHeight - topMargin - bottomMargin;

  function xForDate(dateStr) {
    const d = new Date(dateStr);
    const frac = (d - startDate) / (endDate - startDate);
    return leftMargin + Math.max(0, Math.min(1, frac)) * plotWidth;
  }

  let running = 0;
  const points = rows.map((row) => {
    running += row.amount;
    return {
      total: running,
      date: row.createdAt,
      amount: row.amount,
      isProject: !!(
        row.object &&
        row.object.type === "project" &&
        isDirectFellowshipProject(row.path)
      ),
      name: row.object ? row.object.name : null,
    };
  });

  const maxXp = points[points.length - 1].total;

  function yForTotal(total) {
    return topMargin + plotHeight - (total / maxXp) * plotHeight;
  }

  const coords = points.map((p) => ({
    x: xForDate(p.date),
    y: yForTotal(p.total),
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const fillPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${topMargin + plotHeight} L${leftMargin},${topMargin + plotHeight} Z`;
  const last = coords[coords.length - 1];

  document.getElementById("xp-fill-path").setAttribute("d", fillPath);
  document.getElementById("xp-line-path").setAttribute("d", linePath);
  document.getElementById("xp-point-marker").setAttribute("cx", last.x);
  document.getElementById("xp-point-marker").setAttribute("cy", last.y);

  for (let i = 0; i <= 4; i++) {
    const value = maxXp * (1 - i / 4);
    document.getElementById(`y-label-${i}`).textContent = formatKb(value);
  }

  document.getElementById("x-label-start").textContent =
    formatDateLabel(startDate);
  document.getElementById("x-label-end").textContent = formatDateLabel(endDate);

  const dotsGroup = document.getElementById("xp-project-dots");
  dotsGroup.innerHTML = "";

  const tooltip = document.getElementById("xp-dot-tooltip");
  const svg = document.getElementById("xp-chart-svg");

  points.forEach((p, i) => {
    if (!p.isProject) return;
    const c = coords[i];

    const dot = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    dot.setAttribute("cx", c.x.toFixed(1));
    dot.setAttribute("cy", c.y.toFixed(1));
    dot.setAttribute("r", "4");
    dot.setAttribute("class", "xp-project-dot");

    const label = `${p.name} — ${formatKb(p.amount)} — ${formatDateLabel(p.date)}`;

    dot.addEventListener("mouseenter", () => {
      tooltip.textContent = label;
      tooltip.hidden = false;
    });
    dot.addEventListener("mousemove", (e) => {
      const wrapRect = svg.parentElement.getBoundingClientRect();
      positionTooltipSmart(tooltip, wrapRect, e.clientX, e.clientY);
    });
    dot.addEventListener("mouseleave", () => {
      tooltip.hidden = true;
    });

    dotsGroup.appendChild(dot);
  });

  const lineEl = document.getElementById("xp-line-path");
  const fillEl = document.getElementById("xp-fill-path");
  const pointEl = document.getElementById("xp-point-marker");

  const length = lineEl.getTotalLength();
  lineEl.style.strokeDasharray = length;
  lineEl.style.strokeDashoffset = length;
  fillEl.style.opacity = "0";
  pointEl.style.opacity = "0";
  dotsGroup.style.opacity = "0";

  lineEl.getBoundingClientRect();

  lineEl.style.transition = "stroke-dashoffset 1.4s ease";
  fillEl.style.transition = "opacity 1s ease 0.6s";
  pointEl.style.transition = "opacity 0.4s ease 1.4s";
  dotsGroup.style.transition = "opacity 0.5s ease 1.4s";

  lineEl.style.strokeDashoffset = "0";
  fillEl.style.opacity = "1";
  pointEl.style.opacity = "1";
  dotsGroup.style.opacity = "1";
}
