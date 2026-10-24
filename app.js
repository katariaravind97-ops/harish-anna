const STORAGE_KEY = "campusly-school-records-v2";
const GOALPLAN_STORAGE_KEY = "campusly-goalplans-v1";
const demoStudents = [
  { id: "STU-1024", name: "Aarav Sharma", email: "aarav.sharma@northview.edu", phone: "", guardian: "Raj Sharma", dob: "", className: "10th", section: "A", added: "2026-10-20", attendance: {}, marks: [] },
  { id: "STU-1023", name: "Ananya Patel", email: "ananya.patel@northview.edu", phone: "", guardian: "Neha Patel", dob: "", className: "11th", section: "B", added: "2026-10-19", attendance: {}, marks: [] },
  { id: "STU-1022", name: "Ishaan Reddy", email: "ishaan.reddy@northview.edu", phone: "", guardian: "S. Reddy", dob: "", className: "12th", section: "A", added: "2026-10-18", attendance: {}, marks: [] },
  { id: "STU-1021", name: "Meera Iyer", email: "meera.iyer@northview.edu", phone: "", guardian: "Priya Iyer", dob: "", className: "10th", section: "B", added: "2026-10-17", attendance: {}, marks: [] },
  { id: "STU-1020", name: "Kabir Singh", email: "kabir.singh@northview.edu", phone: "", guardian: "", dob: "", className: "", section: "", added: "2026-10-16", attendance: {}, marks: [] },
  { id: "STU-1019", name: "Diya Nair", email: "diya.nair@northview.edu", phone: "", guardian: "", dob: "", className: "", section: "", added: "2026-10-15", attendance: {}, marks: [] },
  { id: "STU-1018", name: "Arjun Rao", email: "arjun.rao@northview.edu", phone: "", guardian: "", dob: "", className: "", section: "", added: "2026-10-14", attendance: {}, marks: [] },
  { id: "STU-1017", name: "Sana Khan", email: "sana.khan@northview.edu", phone: "", guardian: "", dob: "", className: "", section: "", added: "2026-10-13", attendance: {}, marks: [] },
];

const today = localDate();
const students = loadStudents();
const loginForm = document.getElementById("login-form");
const pageFiles = {
  overview: "overview.html",
  add: "add-student.html",
  groups: "group-students.html",
  ungrouped: "ungrouped-students.html",
  directory: "all-students.html",
  attendance: "attendance.html",
  marks: "marks.html",
  reports: "reports.html",
  goalplan: "goalplan.html",
};

function on(id, eventName, handler) {
  document.getElementById(id)?.addEventListener(eventName, handler);
}

function localDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadStudents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    const previousData = localStorage.getItem("campusly-students-v1");
    if (previousData) {
      try {
        const previousRecords = JSON.parse(previousData);
        if (!Array.isArray(previousRecords)) throw new Error("Previous student data must be a list.");
        const migrated = previousRecords.map((student) => ({
          ...student,
          guardian: student.guardian || "",
          dob: student.dob || "",
          attendance: student.attendance && typeof student.attendance === "object" ? student.attendance : {},
          marks: Array.isArray(student.marks) ? student.marks : [],
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      } catch (error) {
        console.error("Unable to migrate earlier student records.", error);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoStudents));
    return demoStudents.map((student) => ({ ...student, attendance: {}, marks: [] }));
  }
  try {
    const records = JSON.parse(saved);
    if (!Array.isArray(records)) throw new Error("Saved student data must be a list.");
    return records.map((student) => ({
      ...student,
      attendance: student.attendance && typeof student.attendance === "object" ? student.attendance : {},
      marks: Array.isArray(student.marks) ? student.marks : [],
    }));
  } catch (error) {
    console.error("Unable to read saved student records.", error);
    return demoStudents.map((student) => ({ ...student, attendance: {}, marks: [] }));
  }
}

function loadGoalplans() {
  const saved = localStorage.getItem(GOALPLAN_STORAGE_KEY);
  if (!saved) return [];
  try {
    const records = JSON.parse(saved);
    if (!Array.isArray(records)) throw new Error("Saved goalplans must be a list.");
    return records;
  } catch (error) {
    console.error("Unable to read saved goalplans.", error);
    return [];
  }
}

const goalplans = loadGoalplans();

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character]));
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
}

function classLabel(student) {
  return student.className ? `${student.className} · Section ${student.section || "—"}` : "Ungrouped";
}

function displayDate(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function renderGoalplans() {
  const list = document.getElementById("goalplan-list");
  if (!list) return;
  list.innerHTML = goalplans.length ? goalplans.map((goalplan) => `
    <article class="goalplan-item">
      <div class="goalplan-item-icon" aria-hidden="true">◎</div>
      <div class="goalplan-item-copy">
        <div class="goalplan-item-heading"><div><h3>${escapeHtml(goalplan.goalTitle || goalplan.name || "Untitled goalplan")}</h3><p>${escapeHtml(goalplan.studentName || "Student name not provided")} · ${escapeHtml(goalplan.rollNumber || "No roll number")}</p></div><span class="goalplan-payment-badge">${escapeHtml(goalplan.paymentType || "Payment type not set")}</span></div>
        ${goalplan.goalCategory ? `<p class="goalplan-category">${escapeHtml(goalplan.goalCategory)}</p>` : ""}
        ${goalplan.financialGoal ? `<p class="goalplan-category">Planning goal · ${escapeHtml(goalplan.financialGoal)}</p>` : ""}
        <div class="goalplan-item-meta">
          ${goalplan.joinDate || goalplan.targetDate ? `<span>Join date · ${escapeHtml(displayDate(goalplan.joinDate || goalplan.targetDate))}</span>` : ""}
          ${goalplan.courseDuration ? `<span>${escapeHtml(goalplan.courseDuration)} ${escapeHtml(goalplan.durationUnit || "months")}</span>` : ""}
          ${Number.isFinite(Number(goalplan.totalFees)) ? `<span>${escapeHtml(new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(goalplan.totalFees)))}</span>` : ""}
          ${goalplan.goalHorizon ? `<span>Goal · ${escapeHtml(goalplan.goalHorizon)} years</span>` : ""}
          ${Number.isFinite(Number(goalplan.futureValue)) ? `<span>Future value · ${escapeHtml(moneyText(Number(goalplan.futureValue)))}</span>` : ""}
          ${goalplan.protectGoal !== undefined ? `<span>Protection · ${goalplan.protectGoal ? "Yes" : "No"}</span>` : ""}
          ${goalplan.riskProfile ? `<span>${escapeHtml(goalplan.riskProfile)} · ${escapeHtml(goalplan.equityAllocation)}% equity / ${escapeHtml(goalplan.debtAllocation)}% debt</span>` : ""}
          ${goalplan.investmentPreference ? `<span>${escapeHtml(goalplan.investmentPreference)}</span>` : ""}
        </div>
        ${Array.isArray(goalplan.investmentTypes) && goalplan.investmentTypes.length ? `<p class="goalplan-category">Investment areas · ${escapeHtml(goalplan.investmentTypes.join(", "))}</p>` : ""}
      </div>
    </article>`).join("") : '<div class="empty-state goalplan-empty-state"><span class="goalplan-empty-icon" aria-hidden="true">◎</span><b>No goalplans yet</b><p>Create your first goalplan to start tracking a school goal.</p></div>';
}

function setGoalplanStep(step) {
  const form = document.getElementById("goalplan-form");
  if (!form || step < 1 || step > 3) return;
  form.dataset.currentStep = String(step);
  form.querySelectorAll("[data-goalplan-step-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.goalplanStepPanel !== String(step);
  });
  form.querySelectorAll("[data-goalplan-step-button]").forEach((button) => {
    const buttonStep = Number(button.dataset.goalplanStepButton);
    button.classList.toggle("is-active", buttonStep === step);
    button.classList.toggle("is-complete", buttonStep < step);
    if (buttonStep === step) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
    button.disabled = buttonStep > step;
  });
  if (step === 3) renderGoalplanSummary();
}

function moneyText(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function updateGoalplanFutureValue() {
  const presentValue = Number(document.getElementById("goalplan-present-value")?.value);
  const inflationRate = Number(document.getElementById("goalplan-inflation")?.value);
  const horizon = Number(document.getElementById("goalplan-horizon")?.value);
  const futureValue = document.getElementById("goalplan-future-value");
  if (!futureValue) return;
  futureValue.value = Number.isFinite(presentValue) && presentValue > 0
    ? moneyText(presentValue * ((1 + inflationRate / 100) ** horizon))
    : "";
}

function updateGoalplanHorizon() {
  const horizon = document.getElementById("goalplan-horizon");
  const output = document.getElementById("goalplan-horizon-value");
  if (!horizon || !output) return;
  const years = Number(horizon.value);
  output.value = `${years} ${years === 1 ? "year" : "years"}`;
  output.textContent = output.value;
  updateGoalplanFutureValue();
}

function updateGoalplanAllocation() {
  const equity = document.getElementById("goalplan-equity");
  const equityValue = document.getElementById("goalplan-equity-value");
  const debtValue = document.getElementById("goalplan-debt-value");
  const total = document.getElementById("goalplan-allocation-total");
  if (!equity || !equityValue || !debtValue || !total) return;
  const equityAllocation = Number(equity.value);
  equityValue.value = String(equityAllocation);
  equityValue.textContent = String(equityAllocation);
  debtValue.value = String(100 - equityAllocation);
  debtValue.textContent = String(100 - equityAllocation);
  equity.style.setProperty("--equity-share", `${equityAllocation}%`);
  total.textContent = "100% allocated";
  analyzeGoalplanRisk();
}

function analyzeGoalplanRisk() {
  const equity = Number(document.getElementById("goalplan-equity").value);
  const debt = 100 - equity;
  const equityGrowth = Number(document.getElementById("goalplan-equity-growth").value);
  const debtGrowth = Number(document.getElementById("goalplan-debt-growth").value);
  const message = document.getElementById("goalplan-risk-description");
  const equityGrowthField = document.getElementById("goalplan-equity-growth");
  const debtGrowthField = document.getElementById("goalplan-debt-growth");
  const meter = document.querySelector(".goalplan-risk-meter-track");
  if (![equity, debt, equityGrowth, debtGrowth].every(Number.isFinite)
    || !equityGrowthField.checkValidity() || !debtGrowthField.checkValidity()) {
    document.getElementById("goalplan-risk-label").textContent = "Check growth rates";
    meter.setAttribute("aria-valuenow", "0");
    meter.setAttribute("aria-valuetext", "Growth assumptions are invalid");
    document.getElementById("goalplan-risk-needle").style.left = "0%";
    message.textContent = "Enter growth assumptions from 0% to 30%.";
    return false;
  }
  const weightedGrowth = ((equity * equityGrowth) + (debt * debtGrowth)) / 100;
  const profile = weightedGrowth < 8 ? "Conservative" : weightedGrowth < 12 ? "Balanced" : "Growth-focused";
  document.getElementById("goalplan-risk-label").textContent = profile;
  meter.setAttribute("aria-valuenow", weightedGrowth.toFixed(1));
  meter.setAttribute("aria-valuetext", `${profile}: ${weightedGrowth.toFixed(1)}% estimated weighted growth`);
  document.getElementById("goalplan-risk-needle").style.left = `${Math.min(100, (weightedGrowth / 30) * 100)}%`;
  message.textContent = `Illustrative weighted growth assumption: ${weightedGrowth.toFixed(1)}%.`;
  return true;
}

function validateGoalplanStep(step) {
  const panel = document.querySelector(`[data-goalplan-step-panel="${step}"]`);
  if (!panel) return false;
  const invalid = [...panel.querySelectorAll("input, select")].find((field) => !field.checkValidity());
  if (invalid) {
    invalid.reportValidity();
    invalid.focus();
    return false;
  }
  if (step === 2 && !analyzeGoalplanRisk()) return false;
  return true;
}

function renderGoalplanSummary() {
  const summary = document.getElementById("goalplan-summary");
  if (!summary) return;
  const value = (id) => document.getElementById(id).value.trim();
  const paymentType = document.getElementById("goalplan-payment-type").value;
  const durationUnit = document.getElementById("goalplan-duration-unit").value;
  const totalFees = Number(document.getElementById("goalplan-total-fees").value);
  const goalCategory = document.querySelector('input[name="goalCategory"]:checked')?.value || "No focus selected";
  const financialGoal = document.querySelector('input[name="financialGoal"]:checked')?.value || "No goal selected";
  const presentValue = Number(value("goalplan-present-value"));
  const horizon = Number(value("goalplan-horizon"));
  const inflationRate = Number(value("goalplan-inflation"));
  const equity = Number(value("goalplan-equity"));
  const debt = 100 - equity;
  const equityGrowth = Number(value("goalplan-equity-growth"));
  const debtGrowth = Number(value("goalplan-debt-growth"));
  const riskIsValid = analyzeGoalplanRisk();
  const futureValue = presentValue * ((1 + inflationRate / 100) ** horizon);
  const weightedGrowth = ((equity * equityGrowth) + (debt * debtGrowth)) / 100;
  const riskProfile = riskIsValid
    ? weightedGrowth < 8 ? "Conservative" : weightedGrowth < 12 ? "Balanced" : "Growth-focused"
    : "Check growth rates";
  const investments = [...document.querySelectorAll('input[name="investmentTypes"]:checked')].map((input) => input.value);
  const fields = [
    ["Student", value("goalplan-student-name")],
    ["Roll number", value("goalplan-roll-number")],
    ["Join date", displayDate(value("goalplan-join-date"))],
    ["Goal title", value("goalplan-title")],
    ["Goal focus", goalCategory],
    ["Planning goal", financialGoal],
    ["Payment type", paymentType],
    ["Course duration", `${value("goalplan-duration")} ${durationUnit}`],
    ["Course total fees", moneyText(totalFees)],
    ["Goal horizon", `${horizon} ${horizon === 1 ? "year" : "years"}`],
    ["Present goal value", moneyText(presentValue)],
    ["Inflation assumption", `${inflationRate}%`],
    ["Estimated future goal value", moneyText(futureValue)],
    ["Goal protection", document.getElementById("goalplan-protect").checked ? "Yes" : "No"],
    ["Risk profile", `${riskProfile} · ${weightedGrowth.toFixed(1)}% illustrative growth`],
    ["Asset allocation", `Equity ${equity}% · Debt ${debt}%`],
    ["Estimated equity growth", `${equityGrowth}%`],
    ["Estimated debt growth", `${debtGrowth}%`],
    ["Investment areas", investments.length ? investments.join(", ") : "None selected"],
    ["Investment preference", document.querySelector('input[name="investmentPreference"]:checked')?.value || "—"],
  ];
  summary.innerHTML = fields.map(([label, fieldValue]) => `
    <div class="goalplan-summary-item"><span>${escapeHtml(label)}</span><b>${escapeHtml(fieldValue || "—")}</b></div>`).join("");
}

function currentReportClass() {
  return document.querySelector('input[name="report-class"]:checked')?.value || "10th";
}

function filteredStudents(className = "", section = "") {
  return students.filter((student) => (!className || student.className === className)
    && (!section || student.section === section));
}

function attendanceStats(student) {
  const marks = Object.values(student.attendance || {});
  const attended = marks.filter((status) => status === "Present" || status === "Late").length;
  return { attended, recorded: marks.length, percent: marks.length ? Math.round((attended / marks.length) * 100) : null };
}

function averageMark(student) {
  const marks = student.marks || [];
  if (!marks.length) return null;
  return marks.reduce((sum, mark) => sum + (Number(mark.score) / Number(mark.max)) * 100, 0) / marks.length;
}

function percentText(value) {
  return value === null || !Number.isFinite(value) ? "—" : `${Math.round(value)}%`;
}

function avatar(student, index = 0) {
  return `<span class="student-avatar color-${index % 4}">${escapeHtml(initials(student.name))}</span>`;
}

function tableStudent(student, index = 0) {
  return `<span class="table-student">${avatar(student, index)}<b>${escapeHtml(student.name)}</b></span>`;
}

function attendanceOptions(student, date) {
  const current = student.attendance[date] || "";
  return `<select class="mark-status-select" data-attendance-id="${escapeHtml(student.id)}" aria-label="Attendance status for ${escapeHtml(student.name)}">
    <option value="" ${current === "" ? "selected" : ""}>Not marked</option>
    <option ${current === "Present" ? "selected" : ""}>Present</option>
    <option ${current === "Absent" ? "selected" : ""}>Absent</option>
    <option ${current === "Late" ? "selected" : ""}>Late</option>
  </select>`;
}

function renderDashboard() {
  const grouped = students.filter((student) => student.className);
  document.getElementById("dashboard-total").textContent = students.length;
  document.getElementById("dashboard-grouped").textContent = grouped.length;
  const todayRecords = students.filter((student) => student.attendance[today]);
  const present = todayRecords.filter((student) => ["Present", "Late"].includes(student.attendance[today])).length;
  document.getElementById("dashboard-attendance").textContent = todayRecords.length ? `${Math.round((present / todayRecords.length) * 100)}%` : "—";
  const allMarks = students.flatMap((student) => student.marks || []);
  const mean = allMarks.length ? allMarks.reduce((sum, mark) => sum + (mark.score / mark.max) * 100, 0) / allMarks.length : null;
  document.getElementById("dashboard-average").textContent = percentText(mean);
  const recent = [...students].sort((a, b) => b.added.localeCompare(a.added)).slice(0, 4);
  document.getElementById("recent-students").innerHTML = recent.length ? recent.map((student, index) => `
    <div class="recent-row">${avatar(student, index)}
      <span class="recent-student-name"><b>${escapeHtml(student.name)}</b><small>${escapeHtml(student.id)} · ${escapeHtml(classLabel(student))}</small></span>
      <span class="status-tag ${student.className ? "grouped" : ""}">${student.className ? "Enrolled" : "Ungrouped"}</span>
    </div>`).join("") : '<div class="empty-state">No students yet. Add a student to get started.</div>';
}

function renderDirectory() {
  const query = document.getElementById("directory-search").value.trim().toLowerCase();
  const className = document.getElementById("directory-class").value;
  const section = document.getElementById("directory-section").value;
  const records = filteredStudents(className, section).filter((student) =>
    `${student.name} ${student.id} ${student.email} ${student.guardian}`.toLowerCase().includes(query));
  document.getElementById("directory-total").textContent = records.length;
  document.getElementById("ungrouped-nav-count").textContent = students.filter((student) => !student.className).length;
  document.getElementById("directory-table-body").innerHTML = records.length ? records.map((student, index) => `
    <tr><td>${tableStudent(student, index)}</td><td class="id-cell">${escapeHtml(student.id)}</td>
    <td>${escapeHtml(student.className || "—")}</td><td>${escapeHtml(student.section || "—")}</td>
    <td>${escapeHtml(student.guardian || "—")}</td><td>${escapeHtml(student.email || "—")}</td>
    <td>${percentText(attendanceStats(student).percent)}</td><td>${percentText(averageMark(student))}</td>
    <td>${student.className ? `<button type="button" class="row-action unassign-student" data-student-id="${escapeHtml(student.id)}">Ungroup</button>` : ""}
    <button type="button" class="record-action delete-student" data-student-id="${escapeHtml(student.id)}">Remove</button></td></tr>`).join("")
    : '<tr><td class="empty-state-cell" colspan="9">No students match these filters.</td></tr>';
  document.getElementById("directory-footer").textContent = `Showing ${records.length} of ${students.length} enrolled student records`;
}

function renderGroupedAndUngrouped() {
  const ungrouped = students.filter((student) => !student.className);
  const groupBody = document.getElementById("group-table-body");
  if (groupBody) {
    document.getElementById("group-count").textContent = `${ungrouped.length} ungrouped`;
    groupBody.innerHTML = ungrouped.length ? ungrouped.map((student, index) => `
      <tr><td><input class="group-student-check" type="checkbox" value="${escapeHtml(student.id)}" aria-label="Select ${escapeHtml(student.name)}" /></td>
      <td>${tableStudent(student, index)}</td><td class="id-cell">${escapeHtml(student.id)}</td>
      <td>${escapeHtml(student.email || "—")}</td><td>${escapeHtml(displayDate(student.added))}</td></tr>`).join("")
      : '<tr><td class="empty-state-cell" colspan="5">All students are assigned to a class.</td></tr>';
  }
  const ungroupedBody = document.getElementById("ungrouped-table-body");
  if (ungroupedBody) {
    const query = document.getElementById("ungrouped-search").value.trim().toLowerCase();
    const filtered = ungrouped.filter((student) => `${student.name} ${student.id} ${student.email}`.toLowerCase().includes(query));
    document.getElementById("ungrouped-total").textContent = ungrouped.length;
    ungroupedBody.innerHTML = filtered.length ? filtered.map((student, index) => `
      <tr><td>${tableStudent(student, index)}</td><td class="id-cell">${escapeHtml(student.id)}</td>
      <td>${escapeHtml(student.email || "—")}</td><td>${escapeHtml(displayDate(student.added))}</td>
      <td><span class="status-tag">Ungrouped</span></td>
      <td><button class="row-action go-group-student" type="button" data-student-id="${escapeHtml(student.id)}">Group</button></td></tr>`).join("")
      : '<tr><td class="empty-state-cell" colspan="6">No ungrouped students found.</td></tr>';
    document.getElementById("ungrouped-footer").textContent = `${filtered.length} students shown · ${ungrouped.length} need a class assignment`;
  }
}

function renderAttendance() {
  const date = document.getElementById("attendance-date").value || today;
  const records = filteredStudents(document.getElementById("attendance-class").value, document.getElementById("attendance-section").value);
  const saved = records.filter((student) => student.attendance[date]).length;
  document.getElementById("attendance-summary").textContent = `${records.length} student${records.length === 1 ? "" : "s"} in this register`;
  document.getElementById("attendance-completion").textContent = records.length && saved === records.length ? "All attendance saved" : `${saved} of ${records.length} marked`;
  document.getElementById("attendance-table-body").innerHTML = records.length ? records.map((student, index) => `
    <tr><td>${tableStudent(student, index)}</td><td class="id-cell">${escapeHtml(student.id)}</td>
    <td>${escapeHtml(student.className || "—")}</td><td>${escapeHtml(student.section || "—")}</td><td>${attendanceOptions(student, date)}</td></tr>`).join("")
    : '<tr><td class="empty-state-cell" colspan="5">No students match this class and section.</td></tr>';
}

function renderMarksEntry() {
  const className = document.getElementById("exam-class").value;
  const section = document.getElementById("exam-section").value;
  const records = className ? filteredStudents(className, section) : [];
  const max = Number(document.getElementById("exam-max").value) || 100;
  document.getElementById("marks-entry-body").innerHTML = records.length ? records.map((student, index) => `
    <tr><td>${tableStudent(student, index)}</td><td class="id-cell">${escapeHtml(student.id)}</td>
    <td>${escapeHtml(student.section || "—")}</td><td><input type="number" min="0" max="${escapeHtml(max)}" step="0.5" data-mark-student="${escapeHtml(student.id)}" aria-label="Score for ${escapeHtml(student.name)}" placeholder="0–${escapeHtml(max)}" /></td></tr>`).join("")
    : '<tr><td colspan="4" class="empty-state-cell">Choose a class with enrolled students to enter marks.</td></tr>';
}

function renderMarksHistory() {
  const exams = new Map();
  students.forEach((student) => (student.marks || []).forEach((mark) => {
    const key = [mark.exam, mark.subject, student.className, mark.date].join("|");
    if (!exams.has(key)) exams.set(key, { ...mark, className: student.className, scores: [] });
    exams.get(key).scores.push((mark.score / mark.max) * 100);
  }));
  const rows = [...exams.values()].sort((a, b) => b.date.localeCompare(a.date));
  document.getElementById("marks-history-body").innerHTML = rows.length ? rows.map((exam) => {
    const mean = exam.scores.reduce((sum, score) => sum + score, 0) / exam.scores.length;
    return `<tr><td>${escapeHtml(exam.exam)}</td><td>${escapeHtml(exam.subject)}</td><td>${escapeHtml(exam.className)}</td><td>${exam.scores.length}</td><td>${percentText(mean)}</td></tr>`;
  }).join("") : '<tr><td colspan="5" class="empty-state-cell">No assessments recorded yet.</td></tr>';
}

function renderReport() {
  const className = currentReportClass();
  const section = document.getElementById("report-section").value;
  const records = filteredStudents(className, section);
  const attendanceValues = records.map((student) => attendanceStats(student).percent).filter((value) => value !== null);
  const markValues = records.map(averageMark).filter((value) => value !== null);
  const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  document.getElementById("report-student-count").textContent = records.length;
  document.getElementById("report-attendance-average").textContent = percentText(average(attendanceValues));
  document.getElementById("report-marks-average").textContent = percentText(average(markValues));
  document.getElementById("report-table-title").textContent = `${className} class${section ? ` · Section ${section}` : ""} report`;
  document.getElementById("report-footer").textContent = `${records.length} students · ${attendanceValues.length} with attendance records · ${markValues.length} with exam marks`;
  document.getElementById("report-table-body").innerHTML = records.length ? records.map((student, index) => `
    <tr><td>${tableStudent(student, index)}</td><td class="id-cell">${escapeHtml(student.id)}</td><td>${escapeHtml(student.section || "—")}</td>
    <td>${percentText(attendanceStats(student).percent)}</td><td>${percentText(averageMark(student))}</td><td>${(student.marks || []).length}</td></tr>`).join("")
    : '<tr><td colspan="6" class="empty-state-cell">No students are enrolled in this class and section yet.</td></tr>';
}

function renderCurrentPage() {
  const page = document.body.dataset.page;
  if (page === "overview") renderDashboard();
  if (page === "goalplan") renderGoalplans();
  if (page === "directory") renderDirectory();
  if (page === "groups" || page === "ungrouped") renderGroupedAndUngrouped();
  if (page === "attendance") renderAttendance();
  if (page === "marks") {
    renderMarksEntry();
    renderMarksHistory();
  }
  if (page === "reports") renderReport();
}

function setPage(page) {
  const href = pageFiles[page];
  if (href) window.location.assign(href);
}

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const emailName = email.split("@")[0].split("+")[0].replace(/[._-]+/g, " ").trim();
  const displayName = emailName.split(/\s+/).filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || "Student";
  localStorage.setItem("campusly-profile-name", displayName);
  window.location.assign(pageFiles.overview);
});

document.querySelectorAll('input[name="report-class"]').forEach((input) => input.addEventListener("change", renderReport));
document.querySelectorAll("[data-report-class]").forEach((shortcut) => shortcut.addEventListener("click", (event) => {
  const classInput = document.querySelector(`input[name="report-class"][value="${shortcut.dataset.reportClass}"]`);
  if (classInput) {
    classInput.checked = true;
    renderReport();
  } else {
    event.preventDefault();
    window.location.assign(`reports.html?class=${encodeURIComponent(shortcut.dataset.reportClass)}`);
  }
}));

document.querySelectorAll(".profile-button").forEach((button) => button.addEventListener("click", () => {
  localStorage.removeItem("campusly-profile-name");
}));

on("student-form", "submit", (event) => {
  event.preventDefault();
  const id = document.getElementById("student-id").value.trim();
  if (students.some((student) => student.id.toLowerCase() === id.toLowerCase())) {
    window.alert("That student ID is already in use. Please enter a unique ID.");
    document.getElementById("student-id").focus();
    return;
  }
  const student = {
    id,
    name: document.getElementById("student-name").value.trim(),
    email: document.getElementById("student-email").value.trim(),
    phone: document.getElementById("student-phone").value.trim(),
    dob: document.getElementById("student-dob").value,
    guardian: document.getElementById("student-guardian").value.trim(),
    className: document.getElementById("student-class").value,
    section: document.getElementById("student-section").value,
    added: today,
    attendance: {},
    marks: [],
  };
  students.unshift(student);
  saveStudents();
  event.currentTarget.reset();
  renderCurrentPage();
  setPage("directory");
});

on("create-goalplan-button", "click", () => {
  const form = document.getElementById("goalplan-form");
  form.reset();
  const joinDate = document.getElementById("goalplan-join-date");
  if (!joinDate.value) joinDate.value = today;
  updateGoalplanHorizon();
  updateGoalplanAllocation();
  document.getElementById("goalplan-protect-label").textContent = "Yes";
  setGoalplanStep(1);
  form.hidden = false;
  document.getElementById("goalplan-roll-number").focus();
});

on("cancel-goalplan", "click", () => {
  const form = document.getElementById("goalplan-form");
  form.reset();
  const joinDate = document.getElementById("goalplan-join-date");
  if (joinDate) joinDate.value = today;
  updateGoalplanHorizon();
  updateGoalplanAllocation();
  document.getElementById("goalplan-protect-label").textContent = "Yes";
  setGoalplanStep(1);
  form.hidden = true;
  document.getElementById("create-goalplan-button").focus();
});

["goalplan-present-value", "goalplan-inflation"].forEach((id) => {
  on(id, "input", updateGoalplanFutureValue);
  on(id, "change", updateGoalplanFutureValue);
});
on("goalplan-horizon", "input", updateGoalplanHorizon);

document.querySelectorAll("[data-inflation-step]").forEach((button) => button.addEventListener("click", () => {
  const input = document.getElementById("goalplan-inflation");
  const nextRate = Number(input.value) + Number(button.dataset.inflationStep) * 0.5;
  input.value = String(Math.min(20, Math.max(0, nextRate)));
  updateGoalplanFutureValue();
}));

on("goalplan-protect", "change", (event) => {
  document.getElementById("goalplan-protect-label").textContent = event.currentTarget.checked ? "Yes" : "No";
});

on("goalplan-equity", "input", (event) => {
  updateGoalplanAllocation();
});
["goalplan-equity-growth", "goalplan-debt-growth"].forEach((id) => {
  on(id, "input", analyzeGoalplanRisk);
  on(id, "change", analyzeGoalplanRisk);
});

document.querySelectorAll("[data-goalplan-next]").forEach((button) => button.addEventListener("click", () => {
  const currentStep = Number(document.getElementById("goalplan-form").dataset.currentStep || 1);
  if (!validateGoalplanStep(currentStep)) return;
  setGoalplanStep(Number(button.dataset.goalplanNext));
}));

document.querySelectorAll("[data-goalplan-back]").forEach((button) => button.addEventListener("click", () => {
  setGoalplanStep(Number(button.dataset.goalplanBack));
}));

document.querySelectorAll("[data-goalplan-step-button]").forEach((button) => button.addEventListener("click", () => {
  const currentStep = Number(document.getElementById("goalplan-form").dataset.currentStep || 1);
  const targetStep = Number(button.dataset.goalplanStepButton);
  if (targetStep < currentStep) setGoalplanStep(targetStep);
}));

on("goalplan-form", "submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (Number(form.dataset.currentStep) !== 3) return;
  const rollNumber = document.getElementById("goalplan-roll-number").value.trim();
  const studentName = document.getElementById("goalplan-student-name").value.trim();
  const goalTitle = document.getElementById("goalplan-title").value.trim();
  const totalFees = Number(document.getElementById("goalplan-total-fees").value);
  const presentValue = Number(document.getElementById("goalplan-present-value").value);
  const inflationRate = Number(document.getElementById("goalplan-inflation").value);
  const horizon = Number(document.getElementById("goalplan-horizon").value);
  const equityAllocation = Number(document.getElementById("goalplan-equity").value);
  const debtAllocation = 100 - equityAllocation;
  const equityGrowth = Number(document.getElementById("goalplan-equity-growth").value);
  const debtGrowth = Number(document.getElementById("goalplan-debt-growth").value);
  if (!rollNumber || !studentName || !goalTitle || !Number.isFinite(totalFees) || totalFees < 0
    || !Number.isFinite(presentValue) || presentValue <= 0
    || !Number.isFinite(horizon) || horizon < 1 || horizon > 100
    || equityAllocation < 0 || equityAllocation > 100
    || !analyzeGoalplanRisk()) return;
  const weightedGrowth = ((equityAllocation * equityGrowth) + (debtAllocation * debtGrowth)) / 100;
  const financialGoal = document.querySelector('input[name="financialGoal"]:checked')?.value || "";
  goalplans.unshift({
    rollNumber,
    joinDate: document.getElementById("goalplan-join-date").value,
    studentName,
    goalTitle,
    goalCategory: document.querySelector('input[name="goalCategory"]:checked')?.value || "",
    financialGoal,
    paymentType: document.getElementById("goalplan-payment-type").value,
    courseDuration: Number(document.getElementById("goalplan-duration").value),
    durationUnit: document.getElementById("goalplan-duration-unit").value,
    totalFees,
    goalHorizon: horizon,
    presentValue,
    inflationRate,
    futureValue: presentValue * ((1 + inflationRate / 100) ** horizon),
    protectGoal: document.getElementById("goalplan-protect").checked,
    equityAllocation,
    debtAllocation,
    equityGrowth,
    debtGrowth,
    riskProfile: weightedGrowth < 8 ? "Conservative" : weightedGrowth < 12 ? "Balanced" : "Growth-focused",
    weightedGrowth,
    investmentTypes: [...document.querySelectorAll('input[name="investmentTypes"]:checked')].map((input) => input.value),
    investmentPreference: document.querySelector('input[name="investmentPreference"]:checked')?.value || "",
  });
  localStorage.setItem(GOALPLAN_STORAGE_KEY, JSON.stringify(goalplans));
  form.reset();
  const joinDate = document.getElementById("goalplan-join-date");
  if (joinDate) joinDate.value = today;
  setGoalplanStep(1);
  form.hidden = true;
  updateGoalplanHorizon();
  updateGoalplanAllocation();
  document.getElementById("goalplan-protect-label").textContent = "Yes";
  renderGoalplans();
  document.getElementById("create-goalplan-button").focus();
});

on("group-select-all", "change", (event) => {
  document.querySelectorAll(".group-student-check").forEach((checkbox) => { checkbox.checked = event.target.checked; });
});

on("assign-group", "click", () => {
  const selected = [...document.querySelectorAll(".group-student-check:checked")].map((checkbox) => checkbox.value);
  const className = document.getElementById("group-class").value;
  const section = document.getElementById("group-section").value;
  if (!selected.length || !className || !section) {
    window.alert("Select at least one student, a class and a section before assigning.");
    return;
  }
  students.forEach((student) => {
    if (selected.includes(student.id)) {
      student.className = className;
      student.section = section;
    }
  });
  saveStudents();
  renderCurrentPage();
});

on("ungrouped-table-body", "click", (event) => {
  const action = event.target.closest(".go-group-student");
  if (!action) return;
  window.location.assign(`group-students.html?student=${encodeURIComponent(action.dataset.studentId)}`);
});

on("directory-table-body", "click", (event) => {
  const unassign = event.target.closest(".unassign-student");
  if (unassign) {
    const student = students.find((record) => record.id === unassign.dataset.studentId);
    if (!student) return;
    student.className = "";
    student.section = "";
    saveStudents();
    renderCurrentPage();
    return;
  }
  const action = event.target.closest(".delete-student");
  if (!action) return;
  const student = students.find((record) => record.id === action.dataset.studentId);
  if (!student || !window.confirm(`Remove ${student.name} and their attendance and marks from this device?`)) return;
  students.splice(students.indexOf(student), 1);
  saveStudents();
  renderCurrentPage();
});

on("save-attendance", "click", () => {
  const date = document.getElementById("attendance-date").value;
  if (!date) {
    window.alert("Choose an attendance date first.");
    return;
  }
  const controls = [...document.querySelectorAll("#attendance-table-body [data-attendance-id]")];
  if (!controls.length) {
    window.alert("There are no students in the selected class and section.");
    return;
  }
  const unmarked = controls.filter((control) => !control.value);
  if (unmarked.length) {
    window.alert(`Mark attendance for all students. ${unmarked.length} still need a status.`);
    return;
  }
  controls.forEach((control) => {
    const student = students.find((record) => record.id === control.dataset.attendanceId);
    if (student) student.attendance[date] = control.value;
  });
  saveStudents();
  renderCurrentPage();
});

on("mark-all-present", "click", () => {
  document.querySelectorAll("#attendance-table-body [data-attendance-id]").forEach((control) => { control.value = "Present"; });
});

["attendance-date", "attendance-class", "attendance-section"].forEach((id) => {
  on(id, "change", renderAttendance);
});

on("marks-form", "submit", (event) => {
  event.preventDefault();
  const exam = document.getElementById("exam-name").value.trim();
  const subject = document.getElementById("exam-subject").value.trim();
  const max = Number(document.getElementById("exam-max").value);
  const className = document.getElementById("exam-class").value;
  const records = [...document.querySelectorAll("#marks-entry-body [data-mark-student]")];
  const entered = records.filter((input) => input.value !== "");
  if (!records.length || !entered.length) {
    window.alert("Choose a class and enter at least one student's score.");
    return;
  }
  if (entered.some((input) => Number(input.value) > max || Number(input.value) < 0)) {
    window.alert(`Scores must be between 0 and ${max}.`);
    return;
  }
  entered.forEach((input) => {
    const student = students.find((record) => record.id === input.dataset.markStudent);
    if (!student) return;
    const mark = { exam, subject, max, score: Number(input.value), date: today };
    const existing = student.marks.findIndex((item) => item.exam === exam && item.subject === subject && item.date === today);
    if (existing >= 0) student.marks[existing] = mark;
    else student.marks.push(mark);
  });
  saveStudents();
  renderCurrentPage();
  event.currentTarget.reset();
  document.getElementById("exam-max").value = "100";
  renderMarksEntry();
});

["exam-class", "exam-section", "exam-max"].forEach((id) => {
  on(id, "change", renderMarksEntry);
  on(id, "input", renderMarksEntry);
});

["directory-search", "directory-class", "directory-section"].forEach((id) => {
  on(id, "input", renderDirectory);
  on(id, "change", renderDirectory);
});
on("ungrouped-search", "input", renderGroupedAndUngrouped);
on("report-section", "change", renderReport);

on("export-students", "click", () => {
  const columns = ["Student ID", "Name", "Email", "Phone", "Guardian", "Class", "Section", "Attendance %", "Average marks %"];
  const rows = students.map((student) => [
    student.id, student.name, student.email, student.phone, student.guardian,
    student.className, student.section, attendanceStats(student).percent ?? "",
    averageMark(student) === null ? "" : Math.round(averageMark(student)),
  ]);
  const csv = [columns, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = `campusly-students-${today}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
});

const attendanceDate = document.getElementById("attendance-date");
if (attendanceDate) attendanceDate.value = today;
const goalplanJoinDate = document.getElementById("goalplan-join-date");
if (goalplanJoinDate) goalplanJoinDate.value = today;
updateGoalplanHorizon();
updateGoalplanAllocation();

const profileName = localStorage.getItem("campusly-profile-name") || "School Admin";
const firstName = profileName.split(" ")[0];
const profileNameElement = document.getElementById("profile-name");
const profileAvatar = document.getElementById("profile-avatar");
const topbarAvatar = document.getElementById("topbar-avatar");
const ungroupedNavCount = document.getElementById("ungrouped-nav-count");
if (profileNameElement) profileNameElement.textContent = profileName;
if (profileAvatar) profileAvatar.textContent = firstName[0];
if (topbarAvatar) topbarAvatar.textContent = firstName[0];
if (ungroupedNavCount) ungroupedNavCount.textContent = students.filter((student) => !student.className).length;
const welcomeName = document.getElementById("welcome-name");
const greetingText = document.getElementById("greeting-text");
if (welcomeName) welcomeName.textContent = firstName;
if (greetingText) {
  const hour = new Date().getHours();
  greetingText.textContent = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

renderCurrentPage();
if (document.body.dataset.page === "groups") {
  const selectedStudent = new URLSearchParams(window.location.search).get("student");
  const checkbox = [...document.querySelectorAll(".group-student-check")]
    .find((item) => item.value === selectedStudent);
  if (checkbox) checkbox.checked = true;
}
if (document.body.dataset.page === "reports") {
  const className = new URLSearchParams(window.location.search).get("class");
  const classInput = document.querySelector(`input[name="report-class"][value="${className}"]`);
  if (classInput) {
    classInput.checked = true;
    renderReport();
  }
}
