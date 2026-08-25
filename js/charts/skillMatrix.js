const TECHNICAL_SKILL_ORDER = [
  { key: "prog-1", label: "Prog-1" },
  { key: "algo", label: "Algo" },
  { key: "devops", label: "DevOps" },
  { key: "front-end", label: "Front-End" },
  { key: "back-end", label: "Back-End" },
  { key: "stats", label: "Statistics" },
  { key: "game", label: "Game" },
];

const TECHNOLOGY_ORDER = [
  { key: "go", label: "Go" },
  { key: "js", label: "JS" },
  { key: "html", label: "HTML" },
  { key: "docker", label: "Docker" },
  { key: "sql", label: "SQL" },
  { key: "c", label: "C" },
  { key: "git", label: "Git" },
];

function mapSkillsToOrder(order, latestMap) {
  return order.map(({ key, label }) => ({
    name: label,
    amount: latestMap[key] || 0,
  }));
}

function polarPoint(cx, cy, radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function buildRadar(svgId, skills) {
  const svg = document.getElementById(svgId);
  if (!svg || skills.length === 0) {
    return;
  }

  const n = skills.length;
  const cx = 120;
  const cy = 120;
  const maxRadius = 90;

  let gridContent = "";
  [0.33, 0.66, 1].forEach((frac) => {
    const pts = skills
      .map((s, i) => {
        const angle = i * (360 / n);
        const p = polarPoint(cx, cy, maxRadius * frac, angle);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ");
    gridContent += `<polygon points="${pts}"/>`;
  });

  skills.forEach((s, i) => {
    const angle = i * (360 / n);
    const p = polarPoint(cx, cy, maxRadius, angle);
    gridContent += `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}"/>`;
  });

  const dataPts = skills
    .map((s, i) => {
      const angle = i * (360 / n);
      const r = (Math.min(s.amount, 100) / 100) * maxRadius;
      const p = polarPoint(cx, cy, r, angle);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");

  let labelContent = "";
  skills.forEach((s, i) => {
    const angle = i * (360 / n);
    const p = polarPoint(cx, cy, maxRadius + 16, angle);
    const cosVal = Math.cos(((angle - 90) * Math.PI) / 180);
    const anchor =
      Math.abs(cosVal) < 0.3 ? "middle" : p.x > cx ? "start" : "end";
    labelContent += `<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" text-anchor="${anchor}" class="radar-label">${s.name}</text>`;
  });

  svg.innerHTML = `
    <g class="radar-grid">${gridContent}</g>
    <polygon class="radar-fill" points="${dataPts}"/>
    ${labelContent}
  `;
}

async function renderSkillMatrix() {
  const result = await getSkillLevels();
  if (!result.success) {
    return;
  }

  const technologies = mapSkillsToOrder(TECHNOLOGY_ORDER, result.latest);

  buildRadar("skill-radar-technologies", technologies);
}