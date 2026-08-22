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

async function getIdentification() {
  const query = `{ user { id login } }`;
  const result = await runQuery(query);

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.user[0] };
}

async function getResultsWithObjects() {
  const query = `{
    result {
      id
      grade
      path
      createdAt
      object { name type }
    }
  }`;

  const result = await runQuery(query);
  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.result };
}

async function getXpTransactions() {
  const query = `{
    transaction(where: {
      type: { _eq: "xp" },
      invalidatedAt: { _is_null: true }
    }, order_by: { createdAt: asc }) {
      amount
      path
      createdAt
    }
  }`;

  const result = await runQuery(query);
  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.transaction };
}

async function getPiscineResults() {
  const query = `{
    result(where: { _or: [
      { path: { _like: "%discovery-piscine-3w%" } },
      { path: { _like: "%piscine-go-s2wft%" } }
    ] }) {
      id
      grade
      path
      createdAt
    }
  }`;

  const result = await runQuery(query);
  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.result };
}

function isGoPiscine(path) {
  return path.startsWith("/london/piscine-go-s2wft");
}

function isJSPiscine(path) {
  return path.startsWith("/london/discovery-piscine-3w");
}

function isFellowshipJSPiscine(path) {
  return path.startsWith("/london/div-01/piscine-js-up");
}

function isCheckpoints(path) {
  return path.startsWith("/london/div-01/check-points");
}

function isFellowship(path) {
  return path.startsWith("/london/div-01") && !isFellowshipJSPiscine(path);
}

async function getTotalXp() {
  const result = await getXpTransactions();
  if (!result.success) {
    return result;
  }

  const total = result.data.reduce((sum, row) => sum + row.amount, 0);
  return { success: true, total };
}

async function getAuditStats() {
  const idResult = await getIdentification();
  if (!idResult.success) {
    return idResult;
  }
  const myId = idResult.data.id;

  const query = `{
    given: audit(where: { auditorId: { _eq: ${myId} } }) { grade }
    received: audit(where: { group: { captainId: { _eq: ${myId} } } }) { grade }
  }`;

  const result = await runQuery(query);
  if (!result.success) {
    return result;
  }

  const given = result.data.given.length;
  const received = result.data.received.length;
  const ratio = received > 0 ? (given / received).toFixed(2) : "0.00";

  return { success: true, given, received, ratio };
}