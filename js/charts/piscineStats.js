function exerciseRow(ex) {
  const badgeClass = ex.passed ? "badge-pass" : "badge-fail";
  const badgeText = ex.passed ? "pass" : "fail";
  return `
    <article class="project-row">
      <header>
        <p class="project-name">${ex.name}</p>
        <p class="project-meta">${ex.attempts} attempt${ex.attempts === 1 ? "" : "s"}</p>
      </header>
      <span class="badge ${badgeClass}">${badgeText}</span>
    </article>
  `;
}

function piscineGroupBlock(p) {
  const rows = p.exercises.map(exerciseRow).join("");
  return `
    <div class="piscine-group">
      <p class="feed-heading">${p.label} — ${p.passCount}/${p.totalCount} passed</p>
      <div class="feed-scroll">${rows}</div>
    </div>
  `;
}

async function renderPiscineStats() {
  const result = await getPiscineBreakdown();
  if (!result.success) {
    return;
  }

  const container = document.getElementById("piscine-groups");
  container.innerHTML = result.piscines.map(piscineGroupBlock).join("");
}
