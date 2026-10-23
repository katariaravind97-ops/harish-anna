const STORAGE_KEY = "campusly-school-records-v2";
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
const portalToggle = document.getElementById("portal-toggle");

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

function currentReportClass() {
  return document.querySelector('input[name="report-class"]:checked').value;
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
  document.getElementById("group-count").textContent = `${ungrouped.length} ungrouped`;
  document.getElementById("group-table-body").innerHTML = ungrouped.length ? ungrouped.map((student, index) => `
    <tr><td><input class="group-student-check" type="checkbox" value="${escapeHtml(student.id)}" aria-label="Select ${escapeHtml(student.name)}" /></td>
    <td>${tableStudent(student, index)}</td><td class="id-cell">${escapeHtml(student.id)}</td>
    <td>${escapeHtml(student.email || "—")}</td><td>${escapeHtml(displayDate(student.added))}</td></tr>`).join("")
    : '<tr><td class="empty-state-cell" colspan="5">All students are assigned to a class.</td></tr>';
  const query = document.getElementById("ungrouped-search").value.trim().toLowerCase();
  const filtered = ungrouped.filter((student) => `${student.name} ${student.id} ${student.email}`.toLowerCase().includes(query));
  document.getElementById("ungrouped-total").textContent = ungrouped.length;
  document.getElementById("ungrouped-table-body").innerHTML = filtered.length ? filtered.map((student, index) => `
    <tr><td>${tableStudent(student, index)}</td><td class="id-cell">${escapeHtml(student.id)}</td>
    <td>${escapeHtml(student.email || "—")}</td><td>${escapeHtml(displayDate(student.added))}</td>
    <td><span class="status-tag">Ungrouped</span></td>
    <td><button class="row-action go-group-student" type="button" data-student-id="${escapeHtml(student.id)}">Group</button></td></tr>`).join("")
    : '<tr><td class="empty-state-cell" colspan="6">No ungrouped students found.</td></tr>';
  document.getElementById("ungrouped-footer").textContent = `${filtered.length} students shown · ${ungrouped.length} need a class assignment`;
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

function renderAll() {
  renderDashboard();
  renderDirectory();
  renderGroupedAndUngrouped();
  renderAttendance();
  renderMarksEntry();
  renderMarksHistory();
  renderReport();
}

function setPage(page) {
  const control = document.getElementById(`page-${page}`);
  if (control) control.checked = true;
  document.getElementById("mobile-nav-toggle").checked = false;
  if (page === "attendance") renderAttendance();
  if (page === "marks") renderMarksEntry();
  if (page === "reports") renderReport();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const emailName = email.split("@")[0].split("+")[0].replace(/[._-]+/g, " ").trim();
  const displayName = emailName.split(/\s+/).filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || "Student";
  const firstName = displayName.split(" ")[0];
  const hour = new Date().getHours();
  document.getElementById("welcome-name").textContent = displayName;
  document.getElementById("greeting-text").textContent = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  document.getElementById("profile-name").textContent = displayName;
  document.getElementById("profile-avatar").textContent = firstName[0];
  document.getElementById("topbar-avatar").textContent = firstName[0];
  portalToggle.checked = true;
  renderAll();
});

portalToggle.addEventListener("change", () => {
  if (!portalToggle.checked) {
    loginForm.reset();
    document.getElementById("page-overview").checked = true;
  }
});

document.querySelectorAll('input[name="page"]').forEach((input) => input.addEventListener("change", () => {
  if (input.checked) setPage(input.id.replace("page-", ""));
}));
document.querySelectorAll('input[name="report-class"]').forEach((input) => input.addEventListener("change", renderReport));
document.querySelectorAll("[data-report-class]").forEach((shortcut) => shortcut.addEventListener("click", () => {
  document.querySelector(`input[name="report-class"][value="${shortcut.dataset.reportClass}"]`).checked = true;
  renderReport();
}));

document.getElementById("student-form").addEventListener("submit", (event) => {
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
  renderAll();
  setPage("directory");
});

document.getElementById("group-select-all").addEventListener("change", (event) => {
  document.querySelectorAll(".group-student-check").forEach((checkbox) => { checkbox.checked = event.target.checked; });
});

document.getElementById("assign-group").addEventListener("click", () => {
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
  renderAll();
});

document.getElementById("ungrouped-table-body").addEventListener("click", (event) => {
  const action = event.target.closest(".go-group-student");
  if (!action) return;
  setPage("groups");
  const checkbox = [...document.querySelectorAll(".group-student-check")].find((item) => item.value === action.dataset.studentId);
  if (checkbox) checkbox.checked = true;
});

document.getElementById("directory-table-body").addEventListener("click", (event) => {
  const unassign = event.target.closest(".unassign-student");
  if (unassign) {
    const student = students.find((record) => record.id === unassign.dataset.studentId);
    if (!student) return;
    student.className = "";
    student.section = "";
    saveStudents();
    renderAll();
    return;
  }
  const action = event.target.closest(".delete-student");
  if (!action) return;
  const student = students.find((record) => record.id === action.dataset.studentId);
  if (!student || !window.confirm(`Remove ${student.name} and their attendance and marks from this device?`)) return;
  students.splice(students.indexOf(student), 1);
  saveStudents();
  renderAll();
});

document.getElementById("save-attendance").addEventListener("click", () => {
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
  renderAll();
});

document.getElementById("mark-all-present").addEventListener("click", () => {
  document.querySelectorAll("#attendance-table-body [data-attendance-id]").forEach((control) => { control.value = "Present"; });
});

["attendance-date", "attendance-class", "attendance-section"].forEach((id) => {
  document.getElementById(id).addEventListener("change", renderAttendance);
});

document.getElementById("marks-form").addEventListener("submit", (event) => {
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
  renderAll();
  event.currentTarget.reset();
  document.getElementById("exam-max").value = "100";
  renderMarksEntry();
});

["exam-class", "exam-section", "exam-max"].forEach((id) => {
  document.getElementById(id).addEventListener("change", renderMarksEntry);
  document.getElementById(id).addEventListener("input", renderMarksEntry);
});

["directory-search", "directory-class", "directory-section"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderDirectory);
  document.getElementById(id).addEventListener("change", renderDirectory);
});
document.getElementById("ungrouped-search").addEventListener("input", renderGroupedAndUngrouped);
document.getElementById("report-section").addEventListener("change", renderReport);

document.getElementById("export-students").addEventListener("click", () => {
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

document.getElementById("attendance-date").value = today;
renderAll();
