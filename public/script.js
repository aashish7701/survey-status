const params = new URLSearchParams(window.location.search);

const statusIcon = document.getElementById("statusIcon");
const statusLabel = document.getElementById("statusLabel");
const headline = document.getElementById("headline");
const message = document.getElementById("message");
const secondaryMessage = document.getElementById("secondaryMessage");
const headerStatus = document.getElementById("headerStatus");
const detailStatus = document.getElementById("detailStatus");
const projectId = document.getElementById("projectId");
const respondentId = document.getElementById("respondentId");
const dateElement = document.getElementById("date");
const timeElement = document.getElementById("time");
const recordId = document.getElementById("recordId");
const copyButton = document.getElementById("copyButton");
const copyMessage = document.getElementById("copyMessage");

const statuses = {
  complete: {
    className: "status-complete", icon: "✓", label: "COMPLETE",
    title: "Thank you for participating",
    message: "Your responses have been recorded successfully. This complete status will be reported to the survey panel if you were invited through one.",
    secondary: "You may now close this window. No further action is required.",
    display: "Complete"
  },
  quotafull: {
    className: "status-quota", icon: "!", label: "QUOTA FULL",
    title: "Thank you for your interest",
    message: "Unfortunately, this survey has reached its required number of responses.",
    secondary: "You may now close this window. No further action is required.",
    display: "Quota Full"
  },
  disqualify: {
    className: "status-disqualify", icon: "×", label: "DISQUALIFIED",
    title: "Thank you for your interest",
    message: "Unfortunately, you do not qualify for this survey based on the survey requirements.",
    secondary: "You may now close this window. No further action is required.",
    display: "Disqualified"
  },
  securityterm: {
    className: "status-security", icon: "!", label: "SECURITY TERMINATION",
    title: "Survey session terminated",
    message: "This survey session has been terminated due to a security-related issue.",
    secondary: "You may now close this window. No further action is required.",
    display: "Security Termination"
  }
};

async function start() {
  let status = null;
  for (const key of Object.keys(statuses)) {
    if (params.has(key)) {
      status = statuses[key];
      break;
    }
  }

  if (!status) {
    statusIcon.textContent = "?";
    statusLabel.textContent = "INVALID STATUS";
    headline.textContent = "Invalid survey status";
    message.textContent = "No valid survey status was supplied in the URL.";
    secondaryMessage.textContent = "Use complete, quotafull, disqualify, or securityterm.";
    headerStatus.textContent = "INVALID";
    detailStatus.textContent = "Invalid";
    projectId.textContent = params.get("pid") || "N/A";
    respondentId.textContent = params.get("uid") || "N/A";
    updateClock();
    return;
  }

  document.body.classList.add(status.className);
  statusIcon.textContent = status.icon;
  statusLabel.textContent = status.label;
  headline.textContent = status.title;
  message.textContent = status.message;
  secondaryMessage.textContent = status.secondary;
  headerStatus.textContent = status.label;
  detailStatus.textContent = status.display;
  projectId.textContent = params.get("pid") || "N/A";
  respondentId.textContent = params.get("uid") || "N/A";

  updateClock();

  try {
    const response = await fetch(`/api/status?${params.toString()}`);
    const data = await response.json();

    if (response.ok) {
      recordId.textContent = data.id;
      dateElement.textContent = data.date;
      timeElement.textContent = data.time;
    } else {
      recordId.textContent = "Not saved";
    }
  } catch {
    recordId.textContent = "Server offline";
  }
}

function updateClock() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const get = type => parts.find(p => p.type === type)?.value || "";
  dateElement.textContent = `${get("day")}/${get("month")}/${get("year")}`;
  timeElement.textContent = `${get("hour")}:${get("minute")}:${get("second")}`;
}

copyButton.addEventListener("click", async () => {
  const text = [
    `Status: ${detailStatus.textContent}`,
    `Project ID: ${projectId.textContent}`,
    `Respondent ID: ${respondentId.textContent}`,
    `Date: ${dateElement.textContent}`,
    `Time (IST): ${timeElement.textContent}`,
    `Record ID: ${recordId.textContent}`
  ].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    copyMessage.textContent = "Details copied successfully.";
    setTimeout(() => copyMessage.textContent = "", 2500);
  } catch {
    copyMessage.textContent = "Copy failed.";
    setTimeout(() => copyMessage.textContent = "", 2500);
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

start();
