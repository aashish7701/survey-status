const body = document.getElementById("resultsBody");
const search = document.getElementById("search");
const count = document.getElementById("count");

async function loadResults(term = "") {
  body.innerHTML = '<tr><td colspan="6" class="loading">Loading...</td></tr>';

  const url = term
    ? `/api/results?search=${encodeURIComponent(term)}`
    : "/api/results";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed");
    const rows = await response.json();

    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="6" class="empty">No results found.</td></tr>';
      count.textContent = "0 results";
      return;
    }

    body.innerHTML = rows.map(row => `
      <tr>
        <td>${escapeHTML(row.id)}</td>
        <td><span class="badge ${badgeClass(row.status)}">${escapeHTML(row.status)}</span></td>
        <td>${escapeHTML(row.pid || "N/A")}</td>
        <td>${escapeHTML(row.uid || "N/A")}</td>
        <td>${escapeHTML(row.date)}</td>
        <td>${escapeHTML(row.time)}</td>
      </tr>
    `).join("");

    count.textContent = `${rows.length} result${rows.length === 1 ? "" : "s"}`;
  } catch {
    body.innerHTML = '<tr><td colspan="6" class="empty">Could not load results. Is the server running?</td></tr>';
  }
}

function badgeClass(status) {
  if (status === "Complete") return "complete";
  if (status === "Quota Full") return "quota";
  if (status === "Disqualified") return "disqualify";
  return "security";
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.getElementById("searchButton").addEventListener("click", () => loadResults(search.value.trim()));

document.getElementById("clearButton").addEventListener("click", () => {
  search.value = "";
  loadResults();
});

search.addEventListener("keydown", e => {
  if (e.key === "Enter") loadResults(search.value.trim());
});

loadResults();
