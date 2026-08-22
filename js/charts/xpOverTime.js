function formatXp(value) {
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + "k";
  }
  return String(Math.round(value));
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function renderXpChart() {
  const result = await getXpTransactions();
  if (!result.success || result.data.length === 0) {
    return;
  }

  const rows = result.data;

  let running = 0;
  const points = rows.map((row) => {
    running += row.amount;
    return { total: running, date: row.createdAt };
  });

  const maxXp = points[points.length - 1].total;

  const leftMargin = 44;
  const rightMargin = 10;
  const topMargin = 14;
  const bottomMargin = 30;
  const svgWidth = 600;
  const svgHeight = 240;
  const plotWidth = svgWidth - leftMargin - rightMargin;
  const plotHeight = svgHeight - topMargin - bottomMargin;

  const coords = points.map((p, i) => {
    const x =
      leftMargin +
      (points.length === 1 ? plotWidth : (i / (points.length - 1)) * plotWidth);
    const y = topMargin + plotHeight - (p.total / maxXp) * plotHeight;
    return { x, y };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const fillPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${topMargin + plotHeight} L${leftMargin},${topMargin + plotHeight} Z`;
  const last = coords[coords.length - 1];

  document.getElementById("xp-fill-path").setAttribute("d", fillPath);
  document.getElementById("xp-line-path").setAttribute("d", linePath);
  document.getElementById("xp-point-marker").setAttribute("cx", last.x);
  document.getElementById("xp-point-marker").setAttribute("cy", last.y);

  // Y-axis labels: 5 evenly spaced values from maxXp down to 0
  for (let i = 0; i <= 4; i++) {
    const value = maxXp * (1 - i / 4);
    document.getElementById(`y-label-${i}`).textContent = formatXp(value);
  }

  // X-axis labels: first and last transaction date
  document.getElementById("x-label-start").textContent = formatDate(
    points[0].date,
  );
  document.getElementById("x-label-end").textContent = formatDate(
    points[points.length - 1].date,
  );

  // animate the line drawing in
  const lineEl = document.getElementById("xp-line-path");
  const fillEl = document.getElementById("xp-fill-path");
  const pointEl = document.getElementById("xp-point-marker");

  const length = lineEl.getTotalLength();
  lineEl.style.strokeDasharray = length;
  lineEl.style.strokeDashoffset = length;
  fillEl.style.opacity = "0";
  pointEl.style.opacity = "0";

  lineEl.getBoundingClientRect();

  lineEl.style.transition = "stroke-dashoffset 1.4s ease";
  fillEl.style.transition = "opacity 1s ease 0.6s";
  pointEl.style.transition = "opacity 0.4s ease 1.4s";

  lineEl.style.strokeDashoffset = "0";
  fillEl.style.opacity = "1";
  pointEl.style.opacity = "1";
}
