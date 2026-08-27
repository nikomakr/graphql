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
      invalidatedAt: { _is_null: true },
      path: { _like: "/london/div-01%" }
    }, order_by: { createdAt: asc }) {
      amount
      path
      createdAt
      object { name type }
    }
  }`;

  const result = await runQuery(query);
  if (!result.success) {
    return result;
  }

  const filtered = result.data.transaction.filter(
    (row) => !isFellowshipJSPiscine(row.path),
  );

  return { success: true, data: filtered };
}

async function getPiscineResults() {
  const query = `{
    result(where: { path: { _like: "%piscine%" } }) {
      id
      grade
      path
      objectId
      object { name }
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

function isDirectFellowshipProject(path) {
  const segments = path.split("/").filter(Boolean);
  return (
    segments.length === 3 &&
    segments[0] === "london" &&
    segments[1] === "div-01"
  );
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
    given: audit(where: { auditorId: { _eq: ${myId} } }) { closureType grade }
    received: audit(where: { group: { captainId: { _eq: ${myId} } } }) { closureType grade }
  }`;

  const result = await runQuery(query);
  if (!result.success) {
    return result;
  }

  function countByClosure(rows) {
    const counts = {};
    rows.forEach((row) => {
      const key = row.closureType || "pending";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }

  const givenCounts = countByClosure(result.data.given);

  let receivedPass = 0;
  let receivedFail = 0;
  result.data.received.forEach((row) => {
    if (row.grade === null) return;
    if (row.grade >= 1) {
      receivedPass++;
    } else {
      receivedFail++;
    }
  });

  const given = result.data.given.length;
  const received = result.data.received.length;
  const ratio = received > 0 ? (given / received).toFixed(2) : "0.00";

  return {
    success: true,
    givenCounts,
    givenTotal: given,
    receivedPass,
    receivedFail,
    ratio,
  };
}

async function getXpByProject() {
  const query = `{
    transaction(where: {
      type: { _eq: "xp" },
      invalidatedAt: { _is_null: true },
      path: { _like: "/london/div-01%" }
    }) {
      amount
      path
      object { name }
    }
  }`;

  const result = await runQuery(query);
  if (!result.success) {
    return result;
  }

  const totals = {};
  result.data.transaction.forEach((row) => {
    if (!row.object) return;
    if (!isDirectFellowshipProject(row.path)) return;
    const name = row.object.name;
    totals[name] = (totals[name] || 0) + row.amount;
  });

  const items = Object.entries(totals)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  return { success: true, items };
}

async function getProjectPassFail() {
  const query = `{
    result(where: { object: { type: { _eq: "project" } } }) {
      grade
      object { type }
    }
  }`;

  const result = await runQuery(query);
  if (!result.success) {
    return result;
  }

  let pass = 0;
  let fail = 0;
  result.data.result.forEach((row) => {
    if (row.grade === null) return;
    if (row.grade >= 1) {
      pass++;
    } else {
      fail++;
    }
  });

  const total = pass + fail;
  const passPct = total > 0 ? Math.round((pass / total) * 100) : 0;

  return { success: true, pass, fail, passPct };
}

function extractPiscineKey(path) {
  const segments = path.split("/").filter(Boolean);
  const seg = segments.find((s) => s.toLowerCase().includes("piscine"));
  return seg || "other";
}

function prettifyPiscineKey(key) {
  return key.replace(/-/g, " ");
}

async function getPiscineBreakdown() {
  const result = await getPiscineResults();
  if (!result.success) {
    return result;
  }

  const groups = {};

  result.data.forEach((row) => {
    if (!row.object) return;
    const key = extractPiscineKey(row.path);

    if (!groups[key]) {
      groups[key] = {};
    }
    const exerciseKey = row.objectId;
    if (!groups[key][exerciseKey]) {
      groups[key][exerciseKey] = {
        name: row.object.name,
        attempts: 0,
        passed: false,
      };
    }
    groups[key][exerciseKey].attempts++;
    if (row.grade !== null && row.grade >= 1) {
      groups[key][exerciseKey].passed = true;
    }
  });

  const piscines = Object.entries(groups)
    .map(([key, exercises]) => {
      const list = Object.values(exercises).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      return {
        key,
        label: prettifyPiscineKey(key),
        exercises: list,
        passCount: list.filter((e) => e.passed).length,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return { success: true, piscines };
}

async function getCurrentLevel() {
  const query = `{
    transaction(where: { type: { _eq: "level" } }, order_by: { createdAt: desc }, limit: 1) {
      amount
    }
  }`;

  const result = await runQuery(query);
  if (!result.success) {
    return result;
  }

  if (result.data.transaction.length === 0) {
    return { success: true, level: 0 };
  }

  return { success: true, level: result.data.transaction[0].amount };
}

async function getPassedProjects() {
  const query = `{
    transaction(where: {
      type: { _eq: "xp" },
      invalidatedAt: { _is_null: true },
      path: { _like: "/london/div-01%" }
    }, order_by: { createdAt: desc }) {
      path
      createdAt
      object { name }
    }
  }`;

  const result = await runQuery(query);
  if (!result.success) {
    return result;
  }

  const items = result.data.transaction
    .filter((row) => row.object && isDirectFellowshipProject(row.path))
    .map((row) => ({ name: row.object.name, date: row.createdAt }));

  return { success: true, items };
}

async function getSkillLevels() {
  const query = `{
    transaction(where: { type: { _like: "skill_%" }, invalidatedAt: { _is_null: true } }, order_by: { createdAt: desc }) {
      type
      amount
      createdAt
    }
  }`;

  const result = await runQuery(query);
  if (!result.success) {
    return result;
  }

  const latest = {};
  result.data.transaction.forEach((row) => {
    const skillKey = row.type.replace("skill_", "");
    if (!(skillKey in latest)) {
      latest[skillKey] = row.amount;
    }
  });

  return { success: true, latest };
}