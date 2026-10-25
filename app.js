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
  segments: ["Customer segments", "Customers"],
  unassigned: ["Unassigned customers", "Customers"],
  followups: ["Follow-ups", "Engagement"],
  interactions: ["Interactions", "Engagement"],
  reports: ["Customer reports", "Insights"],
  plans: ["Account plans", "Engagement"],
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
  ["segments", "customer-segments.html", "Customer segments"],
  ["unassigned", "unassigned-customers.html", "Unassigned customers"],
  ["followups", "follow-ups.html", "Follow-ups"],
  ["interactions", "interactions.html", "Interactions"],
  ["reports", "reports.html", "Customer reports"],
  ["plans", "account-plans.html", "Account plans"],
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
    ${pageHeading(unassignedOnly ? "CUSTOMER SEGMENTS" : "CUSTOMER MANAGEMENT", unassignedOnly ? "Unassigned customers" : "Customer segments", unassignedOnly ? "Add these customers to a segment to organize your relationships." : "Organize customer accounts by industry, type, or any category that fits your business.")}
    <div class="content-card table-card"><div class="table-toolbar"><div class="table-title"><h2>${unassignedOnly ? "Customers to assign" : "Manage customer segments"} <span class="count-pill">${listed.length}</span></h2><p>Update a customer's segment directly below.</p></div><span class="demo-tag">SAVED IN THIS BROWSER</span></div>
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
  const rows = [...plans].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  renderShell("plans", `
    ${pageHeading("CUSTOMER ENGAGEMENT", "Account plans", "Set a clear objective and next action for important customer relationships.")}
    <form class="content-card student-form" id="plan-form"><div class="form-grid">
      <div class="form-field"><label for="plan-customer">Customer <span>*</span></label>${customerSelect("plan-customer")}</div>
      <div class="form-field"><label for="plan-objective">Account objective <span>*</span></label><input id="plan-objective" placeholder="e.g. Renew annual service agreement" required /></div>
      <div class="form-field"><label for="plan-action">Next action</label><input id="plan-action" placeholder="e.g. Schedule quarterly review" /></div>
      <div class="form-field"><label for="plan-date">Target date</label><input id="plan-date" type="date" /></div>
    </div><div class="form-actions"><button class="primary-button" type="submit">Save account plan →</button></div></form>
    <div class="content-card table-card"><div class="table-toolbar"><div class="table-title"><h2>Customer account plans</h2><p>Objectives and next steps for your customer accounts.</p></div></div>
      <div class="table-scroll"><table><thead><tr><th>CUSTOMER</th><th>OBJECTIVE</th><th>NEXT ACTION</th><th>TARGET DATE</th></tr></thead><tbody>${rows.length ? rows.map((plan) => `<tr><td>${escapeHtml(plan.customerName)}</td><td>${escapeHtml(plan.objective)}</td><td>${escapeHtml(plan.action || "—")}</td><td>${displayDate(plan.dueDate)}</td></tr>`).join("") : '<tr><td class="empty-state-cell" colspan="4">No account plans created yet.</td></tr>'}</tbody></table></div></div>`);
  document.getElementById("plan-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const customer = customerById(document.getElementById("plan-customer").value);
    if (!customer) return;
    const plan = {
      id: `PLAN-${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      objective: document.getElementById("plan-objective").value.trim(),
      action: document.getElementById("plan-action").value.trim(),
      dueDate: document.getElementById("plan-date").value,
    };
    plans.push(plan);
    if (saveList(PLAN_STORAGE_KEY, plans, "customer account plans")) renderPlans();
    else plans.pop();
  });
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
