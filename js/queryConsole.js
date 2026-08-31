const QUERY_EXAMPLES = {
  normal: `{ user { id login } }`,
  nested: `{
    result {
      id
      grade
      path
      createdAt
      object { name type }
    }
  }`,
  argument: `{
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
  }`,
};

function auditExampleQuery() {
  const myId = decodeUserId(getToken());
  return `{
    given: audit(where: { auditorId: { _eq: ${myId} } }) { closureType grade }
    received: audit(where: { group: { captainId: { _eq: ${myId} } } }) { closureType grade }
  }`;
}

function initQueryConsole() {
  const input = document.getElementById("query-console-input");
  const runBtn = document.getElementById("query-console-run");
  const resultContainer = document.getElementById("query-console-result");
  const output = document.getElementById("query-console-output");

  if (!input || !runBtn || !resultContainer || !output) return;

  document.querySelectorAll(".query-example-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.example;
      input.value = key === "audit" ? auditExampleQuery() : QUERY_EXAMPLES[key];
      output.hidden = true;
      clearSectionMessage(resultContainer);
    });
  });

  async function runConsoleQuery() {
    const query = input.value.trim();
    if (!query) {
      showSectionMessage(resultContainer, "Type or load a query first.", "error");
      return;
    }

    output.hidden = true;
    showSectionLoading(resultContainer);

    const result = await runQuery(query);

    if (!result.success) {
      const message =
        result.error === "graphql_error"
          ? result.details.map((e) => e.message).join("; ")
          : "Query failed — check the syntax and your connection.";
      showSectionMessage(resultContainer, message, "error", runConsoleQuery);
      return;
    }

    clearSectionMessage(resultContainer);
    output.textContent = JSON.stringify(result.data, null, 2);
    output.hidden = false;
  }

  runBtn.addEventListener("click", runConsoleQuery);
}

initQueryConsole();