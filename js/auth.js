const CLOSURE_COLORS = {
  succeeded: "#00ff66",
  failed: "#ff3860",
  invalidated: "#7f00ff",
  pending: "#00f2fe",
  expired: "#3a4150",
  unused: "#232a35",
  autoFailed: "#ff3860",
  canceled: "#3a4150",
  reassigned: "#00f2fe",
};

const CLOSURE_LABELS = {
  succeeded: "Succeeded",
  failed: "Failed",
  invalidated: "Invalidated",
  pending: "Pending",
  expired: "Expired",
  unused: "Unused",
  autoFailed: "Auto-failed",
  canceled: "Canceled",
  reassigned: "Reassigned",
};

const CLOSURE_ORDER = [
  "succeeded",
  "failed",
  "invalidated",
  "pending",
  "expired",
  "unused",
  "autoFailed",
  "canceled",
  "reassigned",
];

function renderSegmentedBar(svgId, tooltipId, segments) {
  const svg = document.getElementById(svgId);
  const tooltip = document.getElementById(tooltipId);
  svg.innerHTML = "";

  const barWidth = 300;
  const barHeight = parseFloat(svg.getAttribute("viewBox").split(" ")[3]);
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  let x = 0;

  segments.forEach((seg) => {
    if (seg.count <= 0) return;
    const width = total > 0 ? (seg.count / total) * barWidth : 0;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", 0);
    rect.setAttribute("width", width);
    rect.setAttribute("height", barHeight);
    rect.setAttribute("fill", seg.color);
    rect.setAttribute("stroke", "var(--void)");
    rect.setAttribute("stroke-width", "1.5");

    rect.addEventListener("mouseenter", () => {
      tooltip.textContent = `${seg.label}: ${seg.count}`;
      tooltip.hidden = false;
    });
    rect.addEventListener("mousemove", (e) => {
      const wrapRect = svg.parentElement.getBoundingClientRect();
      tooltip.style.left = `${e.clientX - wrapRect.left + 12}px`;
      tooltip.style.top = `${e.clientY - wrapRect.top + 12}px`;
    });
    rect.addEventListener("mouseleave", () => {
      tooltip.hidden = true;
    });

    svg.appendChild(rect);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x + width / 2);
    text.setAttribute("y", barHeight / 2 + 1);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("fill", "#ffffff");
    text.textContent = seg.count;
    svg.appendChild(text);

    x += width;
  });
}

const SIGNIN_URL = "https://learn.01founders.co/api/auth/signin";

async function signIn(identifier, password) {
  const encoded = btoa(`${identifier}:${password}`);

  let response;
  try {
    response = await fetch(SIGNIN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
      },
    });
  } catch (networkErr) {
    return { success: false, error: "network" };
  }

  if (!response.ok) {
    return { success: false, error: "invalid_credentials" };
  }

  let token;
  try {
    token = await response.json();
  } catch (parseErr) {
    return { success: false, error: "unexpected_response" };
  }

  if (typeof token !== "string" || token.length === 0) {
    return { success: false, error: "unexpected_response" };
  }

  return { success: true, token };
}

function storeToken(token) {
  sessionStorage.setItem("jwt", token);
}

function getToken() {
  return sessionStorage.getItem("jwt");
}

function clearToken() {
  sessionStorage.removeItem("jwt");
}

function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch (err) {
    return false;
  }
}

function decodeUserId(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
  } catch (err) {
    return null;
  }
}

function getLevelTitle(level) {
  if (level <= 9) return "Aspiring Developer";
  if (level <= 19) return "Beginner Developer";
  if (level <= 29) return "Apprentice Developer";
  if (level <= 39) return "Assistant Developer";
  if (level <= 49) return "Basic Developer";
  if (level <= 54) return "Junior Developer";
  if (level <= 59) return "Confirmed Developer";
  else return "Full-Stack Developer";
}

function showLoginView() {
  document.getElementById("login-view").hidden = false;
  document.getElementById("profile-view").hidden = true;
}

function showProfileView() {
  document.getElementById("login-view").hidden = true;
  document.getElementById("profile-view").hidden = false;
  initMatrixBackground();
}

function logout() {
  clearToken();
  document.getElementById("identifier").value = "";
  document.getElementById("password").value = "";
  showLoginView();
}

function passedProjectRow(item) {
  const dateStr = item.date
    ? new Date(item.date).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
  return `
    <article class="project-row">
      <header>
        <p class="project-name">${item.name}</p>
        <p class="project-meta">passed ${dateStr}</p>
      </header>
      <span class="badge badge-pass">pass</span>
    </article>
  `;
}

async function loadProjectsFeed() {
  const result = await getPassedProjects();
  if (!result.success) {
    return;
  }
  document.querySelector("#projects .feed-scroll").innerHTML = result.items
    .map(passedProjectRow)
    .join("");
}

document.getElementById("logout-btn").addEventListener("click", logout);
function showError(message) {
  const errorEl = document.getElementById("login-error");
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError() {
  const errorEl = document.getElementById("login-error");
  errorEl.textContent = "";
  errorEl.hidden = true;
}

document.getElementById("identifier").addEventListener("input", clearError);
document.getElementById("password").addEventListener("input", clearError);

async function loadIdentification() {
  const result = await getIdentification();
  if (result.success) {
    document.querySelector(".handle").textContent = result.data.login;
    document.querySelector(".user-id").textContent = `id #${result.data.id}`;
  }

  const levelResult = await getCurrentLevel();
  if (levelResult.success) {
    document.getElementById("level-value").textContent = levelResult.level;
    document.getElementById("dev-title").textContent = getLevelTitle(
      levelResult.level,
    );
  }

  const xpResult = await getTotalXp();
  if (xpResult.success) {
    const xpInKb = Math.round(xpResult.total / 1000);
    document.getElementById("xp-total-value").textContent = `${xpInKb} kB`;
  }

  renderXpChart();
  renderXpByProjectChart();

  const auditResult = await getAuditStats();
  if (auditResult.success) {
    const received = auditResult.receivedPass + auditResult.receivedFail;

    renderSegmentedBar("total-breakdown-svg", "total-breakdown-tooltip", [
      {
        count: auditResult.givenTotal,
        color: "var(--neon-cyan)",
        label: "Given",
      },
      { count: received, color: "var(--neon-purple)", label: "Received" },
    ]);

    const givenSegments = CLOSURE_ORDER.filter(
      (key) => auditResult.givenCounts[key],
    ).map((key) => ({
      count: auditResult.givenCounts[key],
      color: CLOSURE_COLORS[key] || "#7d8794",
      label: CLOSURE_LABELS[key] || key,
    }));
    renderSegmentedBar(
      "given-breakdown-svg",
      "given-breakdown-tooltip",
      givenSegments,
    );

    renderSegmentedBar("received-breakdown-svg", "received-breakdown-tooltip", [
      {
        count: auditResult.receivedPass,
        color: "var(--neon-green)",
        label: "Pass",
      },
      { count: auditResult.receivedFail, color: "var(--fail)", label: "Fail" },
    ]);

    document.getElementById("audit-ratio-text").textContent = auditResult.ratio;
  }

  renderPiscineStats();
  renderSkillMatrix();

  loadProjectsFeed();

  const projectResult = await getProjectPassFail();
  if (projectResult.success) {
    document.getElementById("project-pass-count").textContent =
      projectResult.pass;
    document.getElementById("project-fail-count").textContent =
      projectResult.fail;
    document.getElementById("project-pass-pct").textContent =
      `${projectResult.passPct}%`;
  }
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const identifier = document.getElementById("identifier").value;
  const password = document.getElementById("password").value;

  const result = await signIn(identifier, password);

  if (result.success) {
    storeToken(result.token);
    const userId = decodeUserId(result.token);
    console.log("logged in, user id:", userId);
    showProfileView();
    loadIdentification();
  } else if (result.error === "network") {
    showError("Can't reach the server. Check your connection and try again.");
  } else {
    showError("Incorrect username/email or password.");
  }
});

(function initSession() {
  const token = getToken();
  if (token && isTokenValid(token)) {
    showProfileView();
    loadIdentification();
  } else {
    showLoginView();
  }
})();