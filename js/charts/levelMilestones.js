const LEVEL_TIERS = [
  { threshold: 0, title: "Aspiring Developer", range: "0–10" },
  { threshold: 11, title: "Beginner Developer", range: "11–20" },
  { threshold: 21, title: "Apprentice Developer", range: "21–30" },
  { threshold: 31, title: "Assistant Developer", range: "31–40" },
  { threshold: 41, title: "Basic Developer", range: "41–50" },
  { threshold: 51, title: "Junior Developer", range: "51–55" },
  { threshold: 56, title: "Confirmed Developer", range: "56–60" },
  { threshold: 61, title: "Full-Stack Developer", range: "61+" },
];

function formatMilestoneDate(dateInput) {
  const d = new Date(dateInput);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function renderLevelMilestones() {
  const result = await getLevelHistory();
  if (!result.success || result.data.length === 0) {
    return;
  }

  const history = result.data;
  const currentLevel = Math.max(...history.map((row) => row.amount));

  const startResult = await getFellowshipStartDate();
  const cohortStart = startResult.success
    ? new Date(startResult.date)
    : new Date("2026-01-06T00:00:00Z");

  const byAmount = [...history].sort((a, b) => a.amount - b.amount);

  const container = document.getElementById("level-milestones");
  if (!container) {
    return;
  }

  container.innerHTML = LEVEL_TIERS.map((tier) => {
    if (currentLevel >= tier.threshold) {
      const dateStr =
        tier.threshold === 0
          ? formatMilestoneDate(cohortStart)
          : formatMilestoneDate(
              byAmount.find((row) => row.amount >= tier.threshold).createdAt,
            );
      return `
        <div class="milestone-row milestone-done">
          <span class="milestone-check">&#10003;</span>
          <span class="milestone-title">${tier.title} <span class="milestone-range">(Levels: ${tier.range})</span></span>
          <span class="milestone-date">${dateStr}</span>
        </div>
      `;
    }

    return `
      <div class="milestone-row milestone-pending">
        <span class="milestone-check"></span>
        <span class="milestone-title">${tier.title} <span class="milestone-range">(Levels: ${tier.range})</span></span>
      </div>
    `;
  }).join("");
}
