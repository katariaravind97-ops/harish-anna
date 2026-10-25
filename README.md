# Cliently

Cliently is a browser-based business workspace for managing customer records and relationships. Records are stored locally in this browser.

## Pages

- [index.html](./index.html) — business workspace sign-in
- [overview.html](./overview.html) — customer and follow-up overview
- [add-customer.html](./add-customer.html) — create a customer record
- [all-customers.html](./all-customers.html) — search, filter, remove, and export customers
- [customer-segments.html](./customer-segments.html) — assign customers to business segments
- [unassigned-customers.html](./unassigned-customers.html) — assign customers to segments
- [follow-ups.html](./follow-ups.html) — schedule and complete follow-ups
- [interactions.html](./interactions.html) — log calls, emails, and meetings
- [reports.html](./reports.html) — customer status and segment reports
- [account-plans.html](./account-plans.html) — create customer goal plans, download personalized PDF reports, and track next actions

All workspace pages share `styles.css` and `app.js`. Customer records, interactions, and account plans are saved in this browser. Saving a goal plan downloads its personalized PDF, and saved plans can be downloaded again from the list. Existing locally saved customer contact details are migrated from earlier versions when possible.
