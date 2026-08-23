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

function showLoginView() {
  document.getElementById("login-view").hidden = false;
  document.getElementById("profile-view").hidden = true;
}

function showProfileView() {
  document.getElementById("login-view").hidden = true;
  document.getElementById("profile-view").hidden = false;
}

function logout() {
  clearToken();
  document.getElementById("identifier").value = "";
  document.getElementById("password").value = "";
  showLoginView();
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

  const xpResult = await getTotalXp();
  if (xpResult.success) {
    document.getElementById("xp-total-value").textContent =
      xpResult.total.toLocaleString();
  }

  renderXpChart();
  renderXpByProjectChart();

  const auditResult = await getAuditStats();
if (auditResult.success) {
  const given = auditResult.givenPass + auditResult.givenFail;
  const received = auditResult.receivedPass + auditResult.receivedFail;
  const totalAll = given + received;
  const barWidth = 300;

  // top bar: given vs received
  const givenWidth = totalAll > 0 ? (given / totalAll) * barWidth : 0;
  const receivedWidth = barWidth - givenWidth;

  const totalGivenRect = document.getElementById("seg-total-given");
  const totalReceivedRect = document.getElementById("seg-total-received");
  totalGivenRect.setAttribute("width", givenWidth);
  totalReceivedRect.setAttribute("x", givenWidth);
  totalReceivedRect.setAttribute("width", receivedWidth);

  document.getElementById("txt-total-given").setAttribute("x", givenWidth / 2);
  document.getElementById("txt-total-given").textContent =
    givenWidth > 24 ? given : "";
  document
    .getElementById("txt-total-received")
    .setAttribute("x", givenWidth + receivedWidth / 2);
  document.getElementById("txt-total-received").textContent =
    receivedWidth > 24 ? received : "";

  // sub bar: given pass vs fail
  const givenPassWidth =
    given > 0 ? (auditResult.givenPass / given) * barWidth : 0;
  const givenFailWidth = barWidth - givenPassWidth;

  document
    .getElementById("seg-given-pass")
    .setAttribute("width", givenPassWidth);
  document.getElementById("seg-given-fail").setAttribute("x", givenPassWidth);
  document
    .getElementById("seg-given-fail")
    .setAttribute("width", givenFailWidth);
  document
    .getElementById("txt-given-pass")
    .setAttribute("x", givenPassWidth / 2);
  document.getElementById("txt-given-pass").textContent =
    givenPassWidth > 16 ? auditResult.givenPass : "";
  document
    .getElementById("txt-given-fail")
    .setAttribute("x", givenPassWidth + givenFailWidth / 2);
  document.getElementById("txt-given-fail").textContent =
    givenFailWidth > 16 ? auditResult.givenFail : "";

  // sub bar: received pass vs fail
  const receivedPassWidth =
    received > 0 ? (auditResult.receivedPass / received) * barWidth : 0;
  const receivedFailWidth = barWidth - receivedPassWidth;

  document
    .getElementById("seg-received-pass")
    .setAttribute("width", receivedPassWidth);
  document
    .getElementById("seg-received-fail")
    .setAttribute("x", receivedPassWidth);
  document
    .getElementById("seg-received-fail")
    .setAttribute("width", receivedFailWidth);
  document
    .getElementById("txt-received-pass")
    .setAttribute("x", receivedPassWidth / 2);
  document.getElementById("txt-received-pass").textContent =
    receivedPassWidth > 16 ? auditResult.receivedPass : "";
  document
    .getElementById("txt-received-fail")
    .setAttribute("x", receivedPassWidth + receivedFailWidth / 2);
  document.getElementById("txt-received-fail").textContent =
    receivedFailWidth > 16 ? auditResult.receivedFail : "";

  document.getElementById("audit-ratio-text").textContent = auditResult.ratio;
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