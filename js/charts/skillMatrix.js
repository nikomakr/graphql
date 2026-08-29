const KNOWN_TECHNOLOGY_KEYS = ["go", "js", "html", "docker", "sql", "c", "git"];

function prettifySkillKey(key) {
  return key
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
}

function classifySkills(latestMap) {
  const technologies = [];
  const technicalSkills = [];

  Object.entries(latestMap).forEach(([key, amount]) => {
    const entry = { name: prettifySkillKey(key), amount };
    if (KNOWN_TECHNOLOGY_KEYS.includes(key)) {
      technologies.push(entry);
    } else {
      technicalSkills.push(entry);
    }
  });

  return { technologies, technicalSkills };
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
  for (let ring = 1; ring <= 10; ring++) {
    const r = (maxRadius * ring) / 10;
    gridContent += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none"/>`;
  }

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
    labelContent += `<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" text-anchor="${anchor}" class="radar-label">${escapeHtml(s.name)}</text>`;
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

  const { technologies, technicalSkills } = classifySkills(result.latest);

  buildRadar("skill-radar-technologies", technologies);

  if (technicalSkills.length > 0) {
    buildRadar("skill-radar-technical", technicalSkills);
  }
}
