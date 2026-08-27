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
  const preview = p.exercises.slice(0, 3).map(exerciseRow).join("");
  const full = p.exercises.map(exerciseRow).join("");
  const total = p.exercises.length;

  return `
    <div class="piscine-group">
      <p class="feed-heading">${p.label} — ${p.passCount}/${total} passed</p>
      <div class="feed-scroll piscine-preview" data-key="${p.key}">${preview}</div>
      ${
        total > 3
          ? `<button type="button" class="view-all-btn" data-key="${p.key}" data-total="${total}">view all ${total}</button>
           <div class="feed-scroll piscine-full" data-key="${p.key}" hidden>${full}</div>`
          : ""
      }
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

  container.querySelectorAll(".view-all-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      const total = btn.dataset.total;
      const preview = container.querySelector(
        `.piscine-preview[data-key="${key}"]`,
      );
      const full = container.querySelector(`.piscine-full[data-key="${key}"]`);
      const willShowFull = full.hidden;

      full.hidden = !willShowFull;
      preview.hidden = willShowFull;
      btn.textContent = willShowFull ? "show fewer" : `view all ${total}`;
    });
  });
}