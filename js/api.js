const GRAPHQL_URL = "https://learn.01founders.co/api/graphql-engine/v1/graphql";

async function runQuery(query, variables = {}) {
  const token = getToken();

  if (!token) {
    return { success: false, error: "no_token" };
  }

  let response;
  try {
    response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (networkErr) {
    return { success: false, error: "network" };
  }

  let json;
  try {
    json = await response.json();
  } catch (parseErr) {
    return { success: false, error: "unexpected_response" };
  }

  if (json.errors) {
    return { success: false, error: "graphql_error", details: json.errors };
  }

  return { success: true, data: json.data };
}