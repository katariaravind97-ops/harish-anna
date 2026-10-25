const CUSTOMER_STORAGE_KEY = "cliently-customers-v1";
const INTERACTION_STORAGE_KEY = "cliently-interactions-v1";
const PLAN_STORAGE_KEY = "cliently-account-plans-v1";
const OLD_CUSTOMER_KEYS = ["campusly-school-records-v2", "campusly-students-v1"];

const demoCustomers = [
  { id: "CUS-1024", name: "Aarav Sharma", company: "Northstar Studio", email: "aarav@example.com", phone: "+91 98765 43210", segment: "Technology", status: "Active", notes: "", added: "2026-10-20", nextFollowUp: "" },
  { id: "CUS-1023", name: "Ananya Patel", company: "Evergreen Retail", email: "ananya@example.com", phone: "+91 98765 43211", segment: "Retail", status: "Active", notes: "", added: "2026-10-19", nextFollowUp: "" },
  { id: "CUS-1022", name: "Ishaan Reddy", company: "Reddy Consulting", email: "ishaan@example.com", phone: "+91 98765 43212", segment: "Professional services", status: "Prospective", notes: "", added: "2026-10-18", nextFollowUp: "" },
  { id: "CUS-1021", name: "Meera Iyer", company: "Meera & Co.", email: "meera@example.com", phone: "+91 98765 43213", segment: "Retail", status: "Active", notes: "", added: "2026-10-17", nextFollowUp: "" },
  { id: "CUS-1020", name: "Kabir Singh", company: "Singh Logistics", email: "kabir@example.com", phone: "+91 98765 43214", segment: "", status: "Prospective", notes: "", added: "2026-10-16", nextFollowUp: "" },
];

const pageInfo = {
  overview: ["Business overview", "Overview"],
  add: ["Add customer", "Customers"],
  directory: ["All customers", "Customers"],
  segments: ["Assign customer", "Customers"],
  unassigned: ["Unassigned customers", "Customers"],
  followups: ["Follow-ups", "Engagement"],
  interactions: ["Interactions", "Engagement"],
  reports: ["Customer reports", "Insights"],
  plans: ["Goal plan", "Engagement"],
};

function localDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character]));
}

function initials(name) {
  return String(name || "?").trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
}

function migrateCustomer(record, index) {
  return {
    id: String(record.id || `CUS-${1024 - index}`).replace(/^STU-/i, "CUS-"),
    name: String(record.name || ""),
    company: String(record.company || ""),
    email: String(record.email || ""),
    phone: String(record.phone || ""),
    segment: String(record.segment || ""),
    status: ["Prospective", "Active", "At risk", "Inactive"].includes(record.status) ? record.status : "Active",
    notes: String(record.notes || ""),
    added: String(record.added || localDate()),
    nextFollowUp: String(record.nextFollowUp || ""),
  };
}

function readList(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const value = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error(`Saved data in ${key} must be a list.`);
  return value;
}

function loadCustomers() {
  try {
    const current = readList(CUSTOMER_STORAGE_KEY);
    if (current) return current.map(migrateCustomer);
    for (const key of OLD_CUSTOMER_KEYS) {
      const previous = readList(key);
      if (previous) {
        const migrated = previous.map(migrateCustomer);
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(demoCustomers));
    return demoCustomers.map((customer) => ({ ...customer }));
  } catch (error) {
    console.error("Unable to load or migrate customer records.", error);
    window.alert("Customer records could not be loaded. Existing data was not changed.");
    return [];
  }
}

function loadList(key, label) {
  try {
    return readList(key) || [];
  } catch (error) {
    console.error(`Unable to load ${label}.`, error);
    window.alert(`${label} could not be loaded. Existing data was not changed.`);
    return [];
  }
}

const customers = loadCustomers();
const interactions = loadList(INTERACTION_STORAGE_KEY, "customer interactions");
const plans = loadList(PLAN_STORAGE_KEY, "customer account plans");
const today = localDate();

function saveList(key, value, label) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Unable to save ${label}.`, error);
    window.alert(`Unable to save ${label}. Check that browser storage is available.`);
    return false;
  }
}

function saveCustomers() {
  return saveList(CUSTOMER_STORAGE_KEY, customers, "customer records");
}

function customerById(id) {
  return customers.find((customer) => customer.id === id);
}

function avatar(customer, index = 0) {
  return `<span class="student-avatar color-${index % 4}">${escapeHtml(initials(customer.name))}</span>`;
}

function customerName(customer, index = 0) {
  return `<span class="table-student">${avatar(customer, index)}<b>${escapeHtml(customer.name)}</b></span>`;
}

function displayDate(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function customerSelect(id, selected = "") {
  return `<select id="${id}" required><option value="">Choose a customer</option>${customers.map((customer) =>
    `<option value="${escapeHtml(customer.id)}" ${customer.id === selected ? "selected" : ""}>${escapeHtml(customer.name)}${customer.company ? ` · ${escapeHtml(customer.company)}` : ""}</option>`).join("")}</select>`;
}

const navLinks = [
  ["overview", "overview.html", "Overview"],
  ["directory", "all-customers.html", "All customers"],
  ["add", "add-customer.html", "Add customer"],
  ["segments", "customer-segments.html", "Assign customer"],
  ["unassigned", "unassigned-customers.html", "Unassigned customers"],
  ["followups", "follow-ups.html", "Follow-ups"],
  ["interactions", "interactions.html", "Interactions"],
  ["reports", "reports.html", "Customer reports"],
  ["plans", "account-plans.html", "Goal plan"],
];

function renderShell(page, content) {
  const [title, section] = pageInfo[page];
  document.title = `Cliently — ${title}`;
  const nav = navLinks.map(([key, href, label]) =>
    `<a class="nav-item ${key === page ? "is-active" : ""}" href="${href}" ${key === page ? 'aria-current="page"' : ""}><span class="nav-icon">${key === "overview" ? "⌂" : key === "add" ? "＋" : key === "reports" ? "▤" : key === "followups" ? "✓" : "☷"}</span>${label}${key === "unassigned" ? `<span class="nav-count">${customers.filter((customer) => !customer.segment).length}</span>` : ""}</a>`).join("");
  document.getElementById("app").innerHTML = `
    <input class="state-control" type="checkbox" id="mobile-nav-toggle" />
    <main class="portal">
      <aside class="sidebar">
        <a class="brand brand-light sidebar-brand" href="overview.html" aria-label="Cliently dashboard"><span class="brand-mark">C</span><span>cliently</span></a>
        <div class="school-switcher"><span class="school-avatar">B</span><span class="school-label"><b>Brightside Business</b><small>Business workspace</small></span></div>
        <div class="nav-label">WORKSPACE</div>
        <nav class="main-nav" aria-label="Main navigation">
          <div class="nav-section-title">CUSTOMERS</div>${nav}
        </nav>
        <div class="sidebar-bottom">
          <div class="help-card"><span class="help-icon">?</span><b>Need a hand?</b><small>We’re here to help</small><a href="mailto:support@cliently.example">Contact support <span>↗</span></a></div>
          <a class="profile-button" href="index.html"><span class="profile-avatar">B</span><span><b>Business Admin</b><small>Administrator · Sign out</small></span><span class="profile-more">↗</span></a>
        </div>
      </aside>
      <label class="sidebar-scrim" for="mobile-nav-toggle" aria-label="Close navigation"></label>
      <section class="portal-main">
        <header class="topbar"><label class="mobile-menu" for="mobile-nav-toggle" aria-label="Open navigation">☰</label><div class="breadcrumbs"><a href="overview.html">Workspace</a><span class="crumb-divider">/</span><b>${escapeHtml(section)}</b><span class="crumb-divider">/</span><b>${escapeHtml(title)}</b></div>
          <div class="topbar-right"><span class="today-label">${new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date())}</span><span class="topbar-avatar">B</span></div>
        </header>
        <div class="page-content"><section class="view-section">${content}</section></div>
      </section>
    </main>`;
}

function pageHeading(eyebrow, heading, intro, action = "") {
  return `<div class="page-heading heading-with-action"><div><div class="eyebrow">${escapeHtml(eyebrow)}</div><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(intro)}</p></div>${action}</div>`;
}

function renderOverview() {
  const active = customers.filter((customer) => customer.status === "Active").length;
  const due = customers.filter((customer) => customer.nextFollowUp && customer.nextFollowUp <= today).length;
  const prospects = customers.filter((customer) => customer.status === "Prospective").length;
  const recent = [...customers].sort((a, b) => b.added.localeCompare(a.added)).slice(0, 5);
  renderShell("overview", `
    ${pageHeading("BUSINESS OVERVIEW", "Welcome to your workspace", "A clear view of your customers and the relationships you’re building.", '<a class="primary-button" href="add-customer.html">＋ Add customer</a>')}
    <div class="stats-grid">
      <article class="stat-card"><div class="stat-top"><span>Total customers</span><span class="stat-icon students-icon">♧</span></div><div class="stat-number">${customers.length}</div><div class="stat-foot"><span>All customer records</span></div></article>
      <article class="stat-card"><div class="stat-top"><span>Active customers</span><span class="stat-icon groups-icon">✓</span></div><div class="stat-number">${active}</div><div class="stat-foot"><span>Currently doing business</span></div></article>
      <article class="stat-card"><div class="stat-top"><span>Follow-ups due</span><span class="stat-icon reports-icon">↗</span></div><div class="stat-number">${due}</div><div class="stat-foot"><a class="inline-link" href="follow-ups.html">Review follow-ups ↗</a></div></article>
      <article class="stat-card"><div class="stat-top"><span>Prospective</span><span class="stat-icon reports-icon">◎</span></div><div class="stat-number">${prospects}</div><div class="stat-foot"><span>Potential new customers</span></div></article>
    </div>
    <article class="content-card recent-card"><div class="card-heading"><div><h2>Recently added customers</h2><p>Your latest customer records</p></div><a class="inline-link" href="all-customers.html">View all →</a></div>
      <div class="recent-list">${recent.length ? recent.map((customer, index) => `<div class="recent-row">${avatar(customer, index)}<span class="recent-student-name"><b>${escapeHtml(customer.name)}</b><small>${escapeHtml(customer.company || customer.id)} · ${escapeHtml(customer.segment || "Unassigned")}</small></span><span class="status-tag">${escapeHtml(customer.status)}</span></div>`).join("") : '<div class="empty-state">No customers yet. Add a customer to get started.</div>'}</div>
    </article>
    <div class="welcome-banner"><div><span class="banner-label">CUSTOMER RELATIONSHIPS, AT A GLANCE</span><h2>Build stronger customer relationships.</h2><p>Keep contact details, follow-ups, and account activity organized in one place.</p><a class="banner-button" href="reports.html">Explore customer reports <span>→</span></a></div></div>`);
}

function renderAddCustomer() {
  renderShell("add", `
    ${pageHeading("CUSTOMER DETAILS", "Add a customer", "Create a customer record for your business directory.")}
    <div class="form-layout"><form class="content-card student-form" id="customer-form">
      <div class="form-section-heading"><span class="form-step">01</span><div><h2>Customer information</h2><p>Enter the customer's business and contact details.</p></div></div>
      <div class="form-grid">
        <div class="form-field"><label for="customer-name">Contact name <span>*</span></label><input id="customer-name" name="name" placeholder="e.g. Alex Morgan" required /></div>
        <div class="form-field"><label for="customer-company">Company / organization</label><input id="customer-company" name="company" placeholder="e.g. Acme Solutions" /></div>
        <div class="form-field"><label for="customer-email">Business email</label><input id="customer-email" name="email" type="email" placeholder="alex@company.com" /></div>
        <div class="form-field"><label for="customer-phone">Phone number</label><input id="customer-phone" name="phone" type="tel" placeholder="+1 555 0100" /></div>
        <div class="form-field"><label for="customer-segment">Customer segment</label><input id="customer-segment" name="segment" placeholder="e.g. Retail, Technology" /></div>
        <div class="form-field"><label for="customer-status">Relationship status</label><select id="customer-status" name="status"><option>Prospective</option><option>Active</option><option>At risk</option><option>Inactive</option></select></div>
        <div class="form-field form-field-wide"><label for="customer-notes">Notes</label><textarea id="customer-notes" name="notes" rows="4" placeholder="Important details about this customer"></textarea></div>
      </div>
      <div class="demo-note">Customer records are saved in this browser on this device. Export a backup from the directory.</div>
      <div class="form-actions"><button type="reset" class="secondary-button">Clear form</button><button type="submit" class="primary-button">Save customer <span>→</span></button></div>
    </form></div>`);
}

function renderDirectory() {
  const records = [...customers].sort((a, b) => a.name.localeCompare(b.name));
  renderShell("directory", `
    ${pageHeading("CUSTOMER DETAILS", "All customers", "Search, review, and manage your customer directory.", '<button class="primary-button" id="export-customers" type="button">Export CSV</button>')}
    <div class="content-card table-card"><div class="table-toolbar"><div class="table-title"><h2>Customer directory <span class="count-pill">${records.length}</span></h2><p>Search or filter customer records.</p></div><div class="table-controls"><label class="search-box"><span>⌕</span><input id="customer-search" placeholder="Search customers..." aria-label="Search customers" /></label><select id="customer-status-filter" aria-label="Filter by relationship status"><option value="">All statuses</option><option>Prospective</option><option>Active</option><option>At risk</option><option>Inactive</option></select></div></div>
      <div class="table-scroll"><table><thead><tr><th>CUSTOMER</th><th>COMPANY</th><th>SEGMENT</th><th>EMAIL</th><th>PHONE</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody id="customer-table-body"></tbody></table></div><div class="table-footer" id="customer-directory-footer"></div>
    </div>`);
  const search = document.getElementById("customer-search");
  const status = document.getElementById("customer-status-filter");
  const draw = () => {
    const query = search.value.trim().toLowerCase();
    const matches = records.filter((customer) => (!status.value || customer.status === status.value)
      && `${customer.name} ${customer.company} ${customer.email} ${customer.phone} ${customer.segment} ${customer.id}`.toLowerCase().includes(query));
    document.getElementById("customer-table-body").innerHTML = matches.length ? matches.map((customer, index) => `<tr><td>${customerName(customer, index)}</td><td>${escapeHtml(customer.company || "—")}</td><td>${escapeHtml(customer.segment || "—")}</td><td>${escapeHtml(customer.email || "—")}</td><td>${escapeHtml(customer.phone || "—")}</td><td><span class="status-tag">${escapeHtml(customer.status)}</span></td><td><button class="record-action" type="button" data-delete-customer="${escapeHtml(customer.id)}">Remove</button></td></tr>`).join("") : '<tr><td class="empty-state-cell" colspan="7">No customers match these filters.</td></tr>';
    document.getElementById("customer-directory-footer").textContent = `Showing ${matches.length} of ${customers.length} customer records`;
  };
  search.addEventListener("input", draw);
  status.addEventListener("change", draw);
  document.getElementById("customer-table-body").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-customer]");
    if (!button) return;
    const customer = customerById(button.dataset.deleteCustomer);
    if (!customer || !window.confirm(`Remove ${customer.name} from your customer directory?`)) return;
    const index = customers.indexOf(customer);
    customers.splice(index, 1);
    if (saveCustomers()) renderDirectory();
    else customers.splice(index, 0, customer);
  });
  document.getElementById("export-customers").addEventListener("click", exportCustomers);
  draw();
}

function renderSegments(unassignedOnly = false) {
  const page = unassignedOnly ? "unassigned" : "segments";
  const listed = customers.filter((customer) => !unassignedOnly || !customer.segment);
  renderShell(page, `
    ${pageHeading(unassignedOnly ? "CUSTOMER SEGMENTS" : "CUSTOMER MANAGEMENT", unassignedOnly ? "Unassigned customers" : "Assign customer", unassignedOnly ? "Add these customers to a segment to organize your relationships." : "Assign customers to business segments to organize your relationships.")}
    <div class="content-card table-card"><div class="table-toolbar"><div class="table-title"><h2>${unassignedOnly ? "Customers to assign" : "Customers and segments"} <span class="count-pill">${listed.length}</span></h2><p>Choose a segment for each customer.</p></div><span class="demo-tag">SAVED IN THIS BROWSER</span></div>
      <div class="table-scroll"><table><thead><tr><th>CUSTOMER</th><th>COMPANY</th><th>EMAIL</th><th>SEGMENT</th><th>STATUS</th></tr></thead><tbody>${listed.length ? listed.map((customer, index) => `<tr><td>${customerName(customer, index)}</td><td>${escapeHtml(customer.company || "—")}</td><td>${escapeHtml(customer.email || "—")}</td><td><input class="segment-input" data-segment-customer="${escapeHtml(customer.id)}" value="${escapeHtml(customer.segment)}" placeholder="Enter a segment" aria-label="Segment for ${escapeHtml(customer.name)}" /></td><td><span class="status-tag">${escapeHtml(customer.status)}</span></td></tr>`).join("") : `<tr><td class="empty-state-cell" colspan="5">${unassignedOnly ? "All customers have a segment." : "No customer records yet."}</td></tr>`}</tbody></table></div>
    </div>`);
  document.querySelectorAll("[data-segment-customer]").forEach((input) => {
    input.addEventListener("change", () => {
      const customer = customerById(input.dataset.segmentCustomer);
      if (!customer) return;
      const previousSegment = customer.segment;
      customer.segment = input.value.trim();
      if (!saveCustomers()) {
        customer.segment = previousSegment;
        input.value = previousSegment;
      } else if (unassignedOnly && customer.segment) renderSegments(true);
    });
  });
}

function renderFollowups() {
  const listed = customers.filter((customer) => customer.nextFollowUp).sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp));
  renderShell("followups", `
    ${pageHeading("CUSTOMER ENGAGEMENT", "Follow-ups", "Schedule and track the next step with each customer.")}
    <form class="content-card marks-form" id="followup-form"><div class="marks-form-fields">
      <div class="form-field"><label for="followup-customer">Customer</label>${customerSelect("followup-customer")}</div>
      <div class="form-field"><label for="followup-date">Follow-up date</label><input id="followup-date" type="date" min="${today}" required /></div>
      <div class="form-field"><label for="followup-note">Next step</label><input id="followup-note" placeholder="e.g. Send updated proposal" /></div>
    </div><div class="form-actions"><button class="primary-button" type="submit">Schedule follow-up →</button></div></form>
    <div class="content-card table-card"><div class="table-toolbar"><div class="table-title"><h2>Scheduled follow-ups</h2><p>Past-due and upcoming customer actions.</p></div></div>
      <div class="table-scroll"><table><thead><tr><th>DATE</th><th>CUSTOMER</th><th>COMPANY</th><th>NEXT STEP</th><th>ACTION</th></tr></thead><tbody>${listed.length ? listed.map((customer) => `<tr><td>${displayDate(customer.nextFollowUp)}</td><td>${escapeHtml(customer.name)}</td><td>${escapeHtml(customer.company || "—")}</td><td>${escapeHtml(customer.followUpNote || "Follow up with customer")}</td><td><button class="row-action" type="button" data-complete-followup="${escapeHtml(customer.id)}">Mark done</button></td></tr>`).join("") : '<tr><td class="empty-state-cell" colspan="5">No follow-ups scheduled yet.</td></tr>'}</tbody></table></div></div>`);
  document.getElementById("followup-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const customer = customerById(document.getElementById("followup-customer").value);
    if (!customer) return;
    const previousDate = customer.nextFollowUp;
    const previousNote = customer.followUpNote;
    customer.nextFollowUp = document.getElementById("followup-date").value;
    customer.followUpNote = document.getElementById("followup-note").value.trim();
    if (saveCustomers()) renderFollowups();
    else {
      customer.nextFollowUp = previousDate;
      customer.followUpNote = previousNote;
    }
  });
  document.querySelectorAll("[data-complete-followup]").forEach((button) => button.addEventListener("click", () => {
    const customer = customerById(button.dataset.completeFollowup);
    if (!customer) return;
    const previousDate = customer.nextFollowUp;
    const previousNote = customer.followUpNote;
    customer.nextFollowUp = "";
    customer.followUpNote = "";
    if (saveCustomers()) renderFollowups();
    else {
      customer.nextFollowUp = previousDate;
      customer.followUpNote = previousNote;
    }
  }));
}

function renderInteractions() {
  const rows = [...interactions].sort((a, b) => b.date.localeCompare(a.date));
  renderShell("interactions", `
    ${pageHeading("CUSTOMER ENGAGEMENT", "Interactions", "Keep a clear history of calls, meetings, and customer conversations.")}
    <form class="content-card marks-form" id="interaction-form"><div class="marks-form-fields">
      <div class="form-field"><label for="interaction-customer">Customer</label>${customerSelect("interaction-customer")}</div>
      <div class="form-field"><label for="interaction-date">Date</label><input id="interaction-date" type="date" value="${today}" required /></div>
      <div class="form-field"><label for="interaction-type">Interaction type</label><select id="interaction-type"><option>Call</option><option>Email</option><option>Meeting</option><option>Other</option></select></div>
      <div class="form-field form-field-wide"><label for="interaction-notes">Summary</label><textarea id="interaction-notes" rows="3" placeholder="What was discussed?"></textarea></div>
    </div><div class="form-actions"><button class="primary-button" type="submit">Log interaction →</button></div></form>
    <div class="content-card table-card"><div class="table-toolbar"><div class="table-title"><h2>Recent interactions</h2><p>Latest activity across your customer accounts.</p></div></div>
      <div class="table-scroll"><table><thead><tr><th>DATE</th><th>CUSTOMER</th><th>COMPANY</th><th>TYPE</th><th>SUMMARY</th></tr></thead><tbody>${rows.length ? rows.map((row) => `<tr><td>${displayDate(row.date)}</td><td>${escapeHtml(row.customerName)}</td><td>${escapeHtml(row.company || "—")}</td><td>${escapeHtml(row.type)}</td><td>${escapeHtml(row.notes || "—")}</td></tr>`).join("") : '<tr><td class="empty-state-cell" colspan="5">No interactions logged yet.</td></tr>'}</tbody></table></div></div>`);
  document.getElementById("interaction-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const customer = customerById(document.getElementById("interaction-customer").value);
    if (!customer) return;
    const interaction = {
      id: `INT-${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      company: customer.company,
      date: document.getElementById("interaction-date").value,
      type: document.getElementById("interaction-type").value,
      notes: document.getElementById("interaction-notes").value.trim(),
    };
    interactions.push(interaction);
    if (saveList(INTERACTION_STORAGE_KEY, interactions, "customer interactions")) renderInteractions();
    else interactions.pop();
  });
}

function renderReports() {
  const statuses = ["Prospective", "Active", "At risk", "Inactive"];
  const segmentCounts = [...new Set(customers.map((customer) => customer.segment).filter(Boolean))].sort();
  const recent = customers.filter((customer) => customer.added.slice(0, 7) === today.slice(0, 7)).length;
  renderShell("reports", `
    ${pageHeading("BUSINESS INSIGHTS", "Customer reports", "Review customer status, segments, and recent growth.")}
    <div class="stats-grid">${statuses.map((status) => `<article class="stat-card"><div class="stat-top"><span>${status} customers</span><span class="stat-icon groups-icon">♧</span></div><div class="stat-number">${customers.filter((customer) => customer.status === status).length}</div><div class="stat-foot"><span>Customer relationship status</span></div></article>`).join("")}
      <article class="stat-card"><div class="stat-top"><span>Added this month</span><span class="stat-icon reports-icon">＋</span></div><div class="stat-number">${recent}</div><div class="stat-foot"><span>New customer records</span></div></article></div>
    <div class="content-card table-card"><div class="table-toolbar"><div class="table-title"><h2>Customers by segment</h2><p>Customer distribution across your business categories.</p></div></div>
      <div class="table-scroll"><table><thead><tr><th>SEGMENT</th><th>CUSTOMERS</th><th>ACTIVE</th><th>PROSPECTIVE</th></tr></thead><tbody>${segmentCounts.length ? segmentCounts.map((segment) => `<tr><td>${escapeHtml(segment)}</td><td>${customers.filter((customer) => customer.segment === segment).length}</td><td>${customers.filter((customer) => customer.segment === segment && customer.status === "Active").length}</td><td>${customers.filter((customer) => customer.segment === segment && customer.status === "Prospective").length}</td></tr>`).join("") : '<tr><td class="empty-state-cell" colspan="4">Assign segments to customers to see a breakdown.</td></tr>'}</tbody></table></div>
    </div>`);
}

function renderPlans() {
  const rows = [...plans].sort((a, b) => String(a.dueDate || "").localeCompare(String(b.dueDate || "")));
  renderShell("plans", `
    ${pageHeading("CUSTOMER ENGAGEMENT", "Goal plan", "Build a thoughtful financial plan for a customer, one step at a time.")}
    <form class="content-card goalplan-form" id="plan-form">
      <div class="goalplan-form-intro"><div><span class="eyebrow">CUSTOMER FINANCIAL PLANNING</span><h2>Create goal plan</h2><p>Enter customer details, explore a suitable plan, and review the summary before saving.</p></div></div>
      <nav class="goalplan-steps" aria-label="Goal plan steps">
        <button class="goalplan-step is-active" type="button" data-plan-step="1" aria-current="step"><span>01</span><span>Goal Information</span></button>
        <span class="goalplan-step-connector" aria-hidden="true"></span>
        <button class="goalplan-step" type="button" data-plan-step="2"><span>02</span><span>Investment Recommendation</span></button>
        <span class="goalplan-step-connector" aria-hidden="true"></span>
        <button class="goalplan-step" type="button" data-plan-step="3"><span>03</span><span>Action Summary</span></button>
      </nav>

      <section class="goalplan-form-section goalplan-step-panel" data-plan-panel="1" aria-labelledby="plan-customer-heading">
        <div class="form-section-heading"><span class="form-step">01</span><div><h2 id="plan-customer-heading">Customer &amp; goal information</h2><p>Choose the customer and define the goal this plan will support.</p></div></div>
        <div class="plan-customer-fields">
          <div class="form-field"><label for="plan-reference">Plan reference</label><input id="plan-reference" value="GP-${Date.now().toString().slice(-6)}" readonly /></div>
          <div class="form-field"><label for="plan-date">Plan date <span>*</span></label><input id="plan-date" type="date" value="${today}" required /></div>
          <div class="form-field"><label for="plan-customer">Customer name <span>*</span></label>${customerSelect("plan-customer")}</div>
          <div class="form-field"><label for="plan-business-age">Business age (years)</label><input id="plan-business-age" type="number" min="0" max="200" placeholder="Optional" /></div>
          <fieldset class="plan-goal-type"><legend>Goal type</legend>
            <label><input type="radio" name="plan-type" value="Lump sum" checked /><span>Lump sum</span></label>
            <label><input type="radio" name="plan-type" value="Regular income" /><span>Regular income</span></label>
            <label><input type="radio" name="plan-type" value="Multiple goals" /><span>Multiple goals</span></label>
          </fieldset>
          <div class="form-field"><label for="plan-title">Goal title <span>*</span></label><input id="plan-title" placeholder="e.g. Expand business operations" required /></div>
        </div>
        <div class="goalplan-focus">
          <div class="goalplan-focus-heading"><div><h3>Select a business goal</h3><p>Choose the outcome this plan is designed to support.</p></div></div>
          <div class="goalplan-goal-options">
            <label class="goalplan-goal-option"><input type="radio" name="plan-goal" value="Business expansion" required /><span class="goalplan-goal-icon" aria-hidden="true">↗</span><b>Business expansion</b></label>
            <label class="goalplan-goal-option"><input type="radio" name="plan-goal" value="Cash flow" /><span class="goalplan-goal-icon" aria-hidden="true">₹</span><b>Cash flow</b></label>
            <label class="goalplan-goal-option"><input type="radio" name="plan-goal" value="Equipment purchase" /><span class="goalplan-goal-icon" aria-hidden="true">⚙</span><b>Equipment purchase</b></label>
            <label class="goalplan-goal-option"><input type="radio" name="plan-goal" value="Business property" /><span class="goalplan-goal-icon" aria-hidden="true">⌂</span><b>Business property</b></label>
            <label class="goalplan-goal-option"><input type="radio" name="plan-goal" value="Retirement income" /><span class="goalplan-goal-icon" aria-hidden="true">◷</span><b>Retirement income</b></label>
          </div>
        </div>
        <div class="goalplan-panel-actions"><span class="plan-step-hint">Step 1 of 3 · Your information stays in this browser.</span><button class="primary-button" type="button" data-plan-next="2">Investment recommendation <span>→</span></button></div>
      </section>

      <section class="goalplan-form-section goalplan-step-panel" data-plan-panel="2" aria-labelledby="plan-investment-heading" hidden>
        <div class="form-section-heading"><span class="form-step">02</span><div><h2 id="plan-investment-heading">Investment recommendation</h2><p>Estimate the future goal value and explore an illustrative allocation.</p></div></div>
        <section class="goalplan-planning-section goalplan-horizon-section" aria-labelledby="plan-horizon-heading">
          <div class="goalplan-horizon-heading"><div><h3 id="plan-horizon-heading">When would you like to reach this goal?</h3><p>Set the investment time horizon.</p></div><output id="plan-horizon-value" for="plan-horizon">13 years</output></div>
          <input class="goalplan-range" id="plan-horizon" type="range" min="1" max="100" value="13" />
          <div class="goalplan-range-labels"><span>1 year</span><span>50 years</span><span>100 years</span></div>
        </section>
        <section class="goalplan-planning-section" aria-label="Goal value and protection">
          <div class="goalplan-value-grid">
            <div class="form-field"><label for="plan-present-value">Present value of the goal <span>*</span></label><div class="goalplan-currency-control"><span aria-hidden="true">₹</span><input id="plan-present-value" type="number" min="1" step="0.01" placeholder="e.g. 600000" required /></div></div>
            <div class="form-field"><label for="plan-inflation">Inflation rate</label><div class="goalplan-stepper"><button type="button" data-inflation-step="-0.5" aria-label="Decrease inflation rate">−</button><input id="plan-inflation" type="number" min="0" max="20" step="0.5" value="6" /><span>%</span><button type="button" data-inflation-step="0.5" aria-label="Increase inflation rate">＋</button></div></div>
            <div class="form-field"><label for="plan-future-value">Estimated future value</label><div class="goalplan-currency-control"><span aria-hidden="true">₹</span><input id="plan-future-value" type="text" placeholder="Enter present value" readonly /></div></div>
          </div>
          <div class="goalplan-protection-row"><div><b>Protect this goal</b><small>Include a protection buffer in the financial estimate.</small></div><label class="goalplan-switch"><input id="plan-protect" type="checkbox" checked /><span></span><b id="plan-protect-label">Yes</b></label></div>
        </section>
        <section class="goalplan-planning-section goalplan-risk-card" aria-labelledby="plan-risk-heading">
          <div class="goalplan-subsection-heading"><div><h3 id="plan-risk-heading">Risk profile &amp; asset allocation</h3><p>Illustrative estimate based on the growth assumptions below.</p></div><span class="optional-label">ESTIMATE</span></div>
          <div class="goalplan-risk-layout">
            <div class="goalplan-risk-visual" aria-live="polite"><div class="goalplan-risk-meter"><div class="goalplan-risk-meter-heading"><span>Illustrative risk profile</span><b id="plan-risk-label">Balanced</b></div><div class="goalplan-risk-meter-track" role="meter" aria-label="Estimated weighted growth" aria-valuemin="0" aria-valuemax="30" aria-valuenow="11"><span id="plan-risk-needle"></span></div><div class="goalplan-risk-meter-labels"><span>Conservative</span><span>Balanced</span><span>Growth</span></div><p id="plan-risk-description">Estimated weighted growth: 11.0%.</p></div><small>This is an illustration only, not financial advice.</small></div>
            <div class="goalplan-risk-fields">
              <div class="goalplan-allocation-heading"><div><b>Asset allocation</b><span>Adjust the illustrative mix</span></div><span class="goalplan-allocation-total" id="plan-allocation-total">100% allocated</span></div>
              <div class="goalplan-allocation-values"><div><i class="goalplan-allocation-dot goalplan-equity-dot"></i>Equity <b id="plan-equity-value">40</b>%</div><div><i class="goalplan-allocation-dot goalplan-debt-dot"></i>Debt <b id="plan-debt-value">60</b>%</div></div>
              <input class="goalplan-allocation-meter" id="plan-equity" type="range" min="0" max="100" value="40" aria-label="Equity allocation percentage" />
              <div class="goalplan-risk-growth"><div class="goalplan-risk-field-heading"><span>Estimated growth rate</span><b>Annual</b></div>
                <div class="goalplan-risk-field"><span>Equity</span><label class="goalplan-percent-control"><input id="plan-equity-growth" type="number" min="0" max="30" step="0.5" value="14" aria-label="Estimated equity growth" /><span>%</span></label></div>
                <div class="goalplan-risk-field"><span>Debt</span><label class="goalplan-percent-control"><input id="plan-debt-growth" type="number" min="0" max="30" step="0.5" value="9" aria-label="Estimated debt growth" /><span>%</span></label></div>
              </div>
            </div>
          </div>
        </section>
        <section class="goalplan-planning-section">
          <div class="goalplan-subsection-heading"><div><h3>Investments earmarked for this goal</h3><p>Select the investment areas to discuss with your customer.</p></div><span class="optional-label">OPTIONAL</span></div>
          <div class="goalplan-investment-options">
            <label><input type="checkbox" name="plan-investment" value="Mutual funds" /><span>Mutual funds</span></label>
            <label><input type="checkbox" name="plan-investment" value="Fixed deposits" /><span>Fixed deposits</span></label>
            <label><input type="checkbox" name="plan-investment" value="Government bonds" /><span>Government bonds</span></label>
            <label><input type="checkbox" name="plan-investment" value="Equity" /><span>Equity</span></label>
            <label><input type="checkbox" name="plan-investment" value="Gold" /><span>Gold</span></label>
            <label><input type="checkbox" name="plan-investment" value="Other" /><span>Other</span></label>
          </div>
        </section>
        <div class="goalplan-panel-actions"><button class="secondary-button" type="button" data-plan-back="1">← Goal information</button><button class="primary-button" type="button" data-plan-next="3">Review action summary <span>→</span></button></div>
      </section>

      <section class="goalplan-form-section goalplan-step-panel" data-plan-panel="3" aria-labelledby="plan-summary-heading" hidden>
        <div class="form-section-heading"><span class="form-step">03</span><div><h2 id="plan-summary-heading">Action summary</h2><p>Review the plan details before saving it to this customer account.</p></div></div>
        <div class="goalplan-summary" id="plan-summary"></div>
        <div class="form-grid plan-action-fields">
          <div class="form-field"><label for="plan-next-action">Next action</label><input id="plan-next-action" placeholder="e.g. Schedule a review with the customer" /></div>
          <div class="form-field"><label for="plan-target-date">Target date</label><input id="plan-target-date" type="date" /></div>
        </div>
        <div class="goalplan-payment-note"><span aria-hidden="true">i</span><p>Estimates are illustrative and do not create or execute any investment or financial product.</p></div>
        <div class="goalplan-panel-actions"><button class="secondary-button" type="button" data-plan-back="2">← Investment recommendation</button><button class="primary-button" type="submit">Save goal plan <span>✓</span></button></div>
      </section>
    </form>
    <div class="content-card table-card goalplan-list-card"><div class="table-toolbar"><div class="table-title"><h2>Saved goal plans <span class="count-pill">${rows.length}</span></h2><p>Plans created for your customer accounts.</p></div></div>
      <div class="table-scroll"><table><thead><tr><th>PLAN REF.</th><th>CUSTOMER</th><th>GOAL</th><th>GOAL TYPE</th><th>FUTURE VALUE</th><th>TARGET DATE</th></tr></thead><tbody>${rows.length ? rows.map((plan) => `<tr><td>${escapeHtml(plan.reference || "—")}</td><td>${escapeHtml(plan.customerName)}</td><td>${escapeHtml(plan.goalTitle || plan.goal || plan.objective || "—")}</td><td>${escapeHtml(plan.goalType || "—")}</td><td>${escapeHtml(plan.futureValue || "—")}</td><td>${displayDate(plan.dueDate)}</td></tr>`).join("") : '<tr><td class="empty-state-cell" colspan="6">No goal plans saved yet. Create your first plan above.</td></tr>'}</tbody></table></div></div>`);

  let currentStep = 1;
  const form = document.getElementById("plan-form");
  const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
  const inputValue = (id) => document.getElementById(id).value.trim();
  const planValue = () => {
    const amount = Number(inputValue("plan-present-value"));
    const inflation = Number(inputValue("plan-inflation"));
    const horizon = Number(document.getElementById("plan-horizon").value);
    return amount * ((1 + inflation / 100) ** horizon);
  };
  const updateFutureValue = () => {
    const amount = Number(inputValue("plan-present-value"));
    document.getElementById("plan-future-value").value = Number.isFinite(amount) && amount > 0 ? money(planValue()) : "";
  };
  const updateRisk = () => {
    const equity = Number(document.getElementById("plan-equity").value);
    const debt = 100 - equity;
    const equityGrowth = Number(inputValue("plan-equity-growth"));
    const debtGrowth = Number(inputValue("plan-debt-growth"));
    const growthFields = [document.getElementById("plan-equity-growth"), document.getElementById("plan-debt-growth")];
    const valid = growthFields.every((field) => field.checkValidity() && Number.isFinite(Number(field.value)));
    document.getElementById("plan-equity-value").textContent = equity;
    document.getElementById("plan-debt-value").textContent = debt;
    document.getElementById("plan-equity").style.setProperty("--equity-share", `${equity}%`);
    const weighted = ((equity * equityGrowth) + (debt * debtGrowth)) / 100;
    const profile = !valid ? "Check growth rates" : weighted < 8 ? "Conservative" : weighted < 12 ? "Balanced" : "Growth-focused";
    document.getElementById("plan-risk-label").textContent = profile;
    document.getElementById("plan-risk-description").textContent = valid ? `Estimated weighted growth: ${weighted.toFixed(1)}%.` : "Enter growth rates from 0% to 30%.";
    const meter = document.querySelector(".goalplan-risk-meter-track");
    meter.setAttribute("aria-valuenow", valid ? weighted.toFixed(1) : "0");
    meter.setAttribute("aria-valuetext", valid ? `${profile}: ${weighted.toFixed(1)}% estimated weighted growth` : "Growth assumptions are invalid");
    document.getElementById("plan-risk-needle").style.left = `${valid ? Math.min(100, weighted / 30 * 100) : 0}%`;
    document.getElementById("plan-allocation-total").textContent = "100% allocated";
    return valid;
  };
  const updateSummary = () => {
    const customer = customerById(inputValue("plan-customer"));
    const horizon = Number(document.getElementById("plan-horizon").value);
    const equity = Number(document.getElementById("plan-equity").value);
    const weighted = ((equity * Number(inputValue("plan-equity-growth"))) + ((100 - equity) * Number(inputValue("plan-debt-growth")))) / 100;
    const fields = [
      ["Plan reference", inputValue("plan-reference")],
      ["Plan date", displayDate(inputValue("plan-date"))],
      ["Customer", customer ? `${customer.name}${customer.company ? ` · ${customer.company}` : ""}` : "—"],
      ["Business age", inputValue("plan-business-age") ? `${inputValue("plan-business-age")} years` : "Not provided"],
      ["Goal type", document.querySelector('input[name="plan-type"]:checked').value],
      ["Goal title", inputValue("plan-title")],
      ["Business goal", document.querySelector('input[name="plan-goal"]:checked')?.value || "—"],
      ["Time horizon", `${horizon} ${horizon === 1 ? "year" : "years"}`],
      ["Present goal value", money(Number(inputValue("plan-present-value")))],
      ["Inflation assumption", `${inputValue("plan-inflation")}%`],
      ["Estimated future value", money(planValue())],
      ["Goal protection", document.getElementById("plan-protect").checked ? "Yes" : "No"],
      ["Risk profile", `${weighted < 8 ? "Conservative" : weighted < 12 ? "Balanced" : "Growth-focused"} · ${weighted.toFixed(1)}% estimated growth`],
      ["Asset allocation", `Equity ${equity}% · Debt ${100 - equity}%`],
      ["Investment areas", [...document.querySelectorAll('input[name="plan-investment"]:checked')].map((input) => input.value).join(", ") || "Not selected"],
    ];
    document.getElementById("plan-summary").innerHTML = fields.map(([label, value]) => `<div class="goalplan-summary-item"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`).join("");
  };
  const showStep = (step) => {
    currentStep = step;
    form.querySelectorAll("[data-plan-panel]").forEach((panel) => { panel.hidden = panel.dataset.planPanel !== String(step); });
    form.querySelectorAll("[data-plan-step]").forEach((button) => {
      const number = Number(button.dataset.planStep);
      button.classList.toggle("is-active", number === step);
      button.classList.toggle("is-complete", number < step);
      if (number === step) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    if (step === 3) updateSummary();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const validateStep = (step) => {
    const panel = form.querySelector(`[data-plan-panel="${step}"]`);
    const invalid = [...panel.querySelectorAll("input[required], select[required]")].find((field) => !field.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      invalid.focus();
      return false;
    }
    if (step === 2 && !updateRisk()) {
      document.getElementById("plan-equity-growth").reportValidity();
      return false;
    }
    return true;
  };

  form.querySelectorAll("[data-plan-next]").forEach((button) => button.addEventListener("click", () => {
    if (validateStep(currentStep)) showStep(Number(button.dataset.planNext));
  }));
  form.querySelectorAll("[data-plan-back]").forEach((button) => button.addEventListener("click", () => showStep(Number(button.dataset.planBack))));
  form.querySelectorAll("[data-plan-step]").forEach((button) => button.addEventListener("click", () => {
    const target = Number(button.dataset.planStep);
    if (target <= currentStep) {
      showStep(target);
      return;
    }
    for (let step = currentStep; step < target; step += 1) {
      if (!validateStep(step)) return;
    }
    showStep(target);
  }));
  document.getElementById("plan-horizon").addEventListener("input", (event) => {
    const years = Number(event.target.value);
    document.getElementById("plan-horizon-value").textContent = `${years} ${years === 1 ? "year" : "years"}`;
    updateFutureValue();
  });
  ["plan-present-value", "plan-inflation"].forEach((id) => document.getElementById(id).addEventListener("input", updateFutureValue));
  document.querySelectorAll("[data-inflation-step]").forEach((button) => button.addEventListener("click", () => {
    const field = document.getElementById("plan-inflation");
    field.value = String(Math.max(0, Math.min(20, Number(field.value) + Number(button.dataset.inflationStep))));
    field.dispatchEvent(new Event("input", { bubbles: true }));
  }));
  ["plan-equity", "plan-equity-growth", "plan-debt-growth"].forEach((id) => document.getElementById(id).addEventListener("input", updateRisk));
  document.getElementById("plan-protect").addEventListener("change", (event) => {
    document.getElementById("plan-protect-label").textContent = event.target.checked ? "Yes" : "No";
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (currentStep !== 3 || !validateStep(1) || !validateStep(2)) return;
    const customer = customerById(inputValue("plan-customer"));
    if (!customer) return;
    const equity = Number(document.getElementById("plan-equity").value);
    const plan = {
      id: `PLAN-${Date.now()}`,
      reference: inputValue("plan-reference"),
      planDate: inputValue("plan-date"),
      customerId: customer.id,
      customerName: customer.name,
      company: customer.company,
      businessAge: inputValue("plan-business-age"),
      goalType: document.querySelector('input[name="plan-type"]:checked').value,
      goalTitle: inputValue("plan-title"),
      goal: document.querySelector('input[name="plan-goal"]:checked').value,
      horizon: Number(document.getElementById("plan-horizon").value),
      presentValue: Number(inputValue("plan-present-value")),
      inflation: Number(inputValue("plan-inflation")),
      futureValue: money(planValue()),
      protectGoal: document.getElementById("plan-protect").checked,
      riskProfile: document.getElementById("plan-risk-label").textContent,
      equityAllocation: equity,
      debtAllocation: 100 - equity,
      investments: [...document.querySelectorAll('input[name="plan-investment"]:checked')].map((input) => input.value),
      action: inputValue("plan-next-action"),
      dueDate: inputValue("plan-target-date"),
    };
    plans.push(plan);
    if (saveList(PLAN_STORAGE_KEY, plans, "customer goal plans")) renderPlans();
    else plans.pop();
  });
  updateRisk();
}

function exportCustomers() {
  const fields = ["id", "name", "company", "email", "phone", "segment", "status", "notes", "added", "nextFollowUp"];
  const rows = [fields, ...customers.map((customer) => fields.map((field) => customer[field] || ""))];
  const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = "customers.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 0);
}

function renderLogin() {
  document.title = "Cliently — Business customer workspace";
  document.getElementById("login-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.href = "overview.html";
  });
}

function initializePage() {
  if (document.getElementById("login-form")) {
    renderLogin();
    return;
  }
  const page = document.body.dataset.page;
  if (page === "overview") renderOverview();
  else if (page === "add") renderAddCustomer();
  else if (page === "directory") renderDirectory();
  else if (page === "segments") renderSegments();
  else if (page === "unassigned") renderSegments(true);
  else if (page === "followups") renderFollowups();
  else if (page === "interactions") renderInteractions();
  else if (page === "reports") renderReports();
  else if (page === "plans") renderPlans();

  document.getElementById("customer-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("customer-name").value.trim();
    const customer = {
      id: `CUS-${Date.now()}`,
      name,
      company: document.getElementById("customer-company").value.trim(),
      email: document.getElementById("customer-email").value.trim(),
      phone: document.getElementById("customer-phone").value.trim(),
      segment: document.getElementById("customer-segment").value.trim(),
      status: document.getElementById("customer-status").value,
      notes: document.getElementById("customer-notes").value.trim(),
      added: today,
      nextFollowUp: "",
    };
    customers.unshift(customer);
    if (saveCustomers()) window.location.href = "all-customers.html";
    else customers.shift();
  });
}

initializePage();
