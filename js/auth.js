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

function decodeUserId(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
  } catch (err) {
    return null;
  }
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const identifier = document.getElementById("identifier").value;
  const password = document.getElementById("password").value;

  const result = await signIn(identifier, password);

  if (result.success) {
    storeToken(result.token);
    const userId = decodeUserId(result.token);
    console.log("logged in, user id:", userId);
  } else {
    console.log("signIn failed:", result.error);
  }
});