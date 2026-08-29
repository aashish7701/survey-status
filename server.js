const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

const db = new Database(path.join(__dirname, "survey.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS survey_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL,
    pid TEXT,
    uid TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

app.use(express.static(path.join(__dirname, "public")));

const STATUS_MAP = {
  complete: "Complete",
  quotafull: "Quota Full",
  disqualify: "Disqualified",
  securityterm: "Security Termination"
};

function getISTDateTime() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const get = (type) => parts.find(p => p.type === type)?.value || "";

  return {
    date: `${get("day")}/${get("month")}/${get("year")}`,
    time: `${get("hour")}:${get("minute")}:${get("second")}`,
    createdAt: new Date().toISOString()
  };
}

app.get("/api/status", (req, res) => {
  let statusKey = null;

  for (const key of Object.keys(STATUS_MAP)) {
    if (Object.prototype.hasOwnProperty.call(req.query, key)) {
      statusKey = key;
      break;
    }
  }

  if (!statusKey) {
    return res.status(400).json({
      error: "Invalid status. Use complete, quotafull, disqualify or securityterm."
    });
  }

  const { date, time, createdAt } = getISTDateTime();
  const pid = req.query.pid || null;
  const uid = req.query.uid || null;
  const status = STATUS_MAP[statusKey];

  const statement = db.prepare(`
    INSERT INTO survey_results
    (status, pid, uid, date, time, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = statement.run(status, pid, uid, date, time, createdAt);

  res.json({
    id: result.lastInsertRowid,
    status,
    pid: pid || "N/A",
    uid: uid || "N/A",
    date,
    time
  });
});

app.get("/api/results", (req, res) => {
  const search = String(req.query.search || "").trim();

  let rows;

  if (search) {
    rows = db.prepare(`
      SELECT * FROM survey_results
      WHERE pid LIKE ? OR uid LIKE ? OR status LIKE ?
      ORDER BY id DESC
    `).all(`%${search}%`, `%${search}%`, `%${search}%`);
  } else {
    rows = db.prepare(`
      SELECT * FROM survey_results
      ORDER BY id DESC
    `).all();
  }

  res.json(rows);
});

app.get("/api/results.csv", (req, res) => {
  const rows = db.prepare(`
    SELECT id, status, pid, uid, date, time, created_at
    FROM survey_results
    ORDER BY id DESC
  `).all();

  const header = ["ID", "Status", "Project ID", "Respondent ID", "Date", "Time (IST)", "Created At"];

  const escapeCSV = (value) => {
    const str = value == null ? "" : String(value);
    return `"${str.replaceAll('"', '""')}"`;
  };

  const csv = [
    header.map(escapeCSV).join(","),
    ...rows.map(row => [
      row.id,
      row.status,
      row.pid,
      row.uid,
      row.date,
      row.time,
      row.created_at
    ].map(escapeCSV).join(","))
  ].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="survey-results.csv"');
  res.send(csv);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
