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

  const auditResult = await getAuditStats();
  if (auditResult.success) {
    document.querySelector(".up-label").textContent =
      `given ${auditResult.given}`;
    document.querySelector(".down-label").textContent =
      `received ${auditResult.received}`;
    document.getElementById("ratio-value-text").textContent =
          auditResult.ratio;

    const total = auditResult.given + auditResult.received;
    const fillWidth = total > 0 ? (auditResult.given / total) * 300 : 150;
    document.getElementById("ratio-fill").setAttribute("width", fillWidth);
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