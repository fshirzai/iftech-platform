export const portalSections = {
  "admin": {
    "title": "Command center",
    "subtitle": "Operate your company from one workspace.",
    "nav": [
      "overview",
      "products",
      "demos",
      "services",
      "portfolio",
      "content",
      "leads",
      "clients",
      "quotations",
      "orders",
      "contracts",
      "projects",
      "tasks",
      "finance",
      "invoices",
      "payments",
      "expenses",
      "licenses",
      "subscriptions",
      "support",
      "employees",
      "careers",
      "analytics",
      "notifications",
      "users",
      "roles",
      "settings",
      "audit-logs"
    ]
  },
  "client": {
    "title": "Client workspace",
    "subtitle": "Your software, projects, and support in one place.",
    "nav": [
      "overview",
      "my-software",
      "orders",
      "quotations",
      "projects",
      "milestones",
      "invoices",
      "payments",
      "licenses",
      "subscriptions",
      "support",
      "messages",
      "documents",
      "notifications",
      "settings"
    ]
  },
  "staff": {
    "title": "Team workspace",
    "subtitle": "Focus on delivery, collaboration, and customers.",
    "nav": [
      "overview",
      "assigned-projects",
      "tasks",
      "milestones",
      "timesheets",
      "documents",
      "messages",
      "notifications",
      "settings"
    ]
  },
  "sales": {
    "title": "Sales workspace",
    "subtitle": "Manage opportunities from inquiry to agreement.",
    "nav": [
      "overview",
      "leads",
      "clients",
      "consultations",
      "quotations",
      "orders",
      "contracts",
      "reports"
    ]
  },
  "projects": {
    "title": "Delivery workspace",
    "subtitle": "Plan, coordinate, and deliver exceptional work.",
    "nav": [
      "overview",
      "projects",
      "milestones",
      "tasks",
      "team",
      "risks",
      "change-requests",
      "deliverables",
      "reports"
    ]
  },
  "finance": {
    "title": "Finance workspace",
    "subtitle": "Track billing, payments, and financial performance.",
    "nav": [
      "overview",
      "invoices",
      "payments",
      "expenses",
      "refunds",
      "reports"
    ]
  },
  "support": {
    "title": "Support workspace",
    "subtitle": "Resolve client issues and protect service quality.",
    "nav": [
      "overview",
      "tickets",
      "assignments",
      "knowledge-base",
      "maintenance",
      "reports"
    ]
  },
  "content": {
    "title": "Content studio",
    "subtitle": "Manage IFTECH\u2019s public presence and stories.",
    "nav": [
      "overview",
      "pages",
      "services",
      "products",
      "portfolio",
      "case-studies",
      "blog",
      "testimonials",
      "media",
      "faq",
      "seo"
    ]
  }
} as const;
export const publicPages = ["about", "services", "products", "demos", "portfolio", "case-studies", "technologies", "process", "pricing", "custom-software", "request-quote", "consultation", "blog", "careers", "faq", "contact", "privacy", "terms", "refund-policy", "cookies"] as const;
export const productCards = [
{slug:'school-mis',title:'School Management System',tag:'EDUCATION',description:'Student lifecycle, attendance, examinations, fees, and reporting.',features:['Students','Attendance','Examinations','Finance']},
{slug:'inventory-pos',title:'Inventory & POS',tag:'RETAIL',description:'Stock movement, sales, suppliers, and inventory intelligence.',features:['Sales','Inventory','Purchases','Reports']},
{slug:'trading-mis',title:'Trading Operations MIS',tag:'ENTERPRISE',description:'Quotations, orders, warehouse reservations, procurement and shipment tracking.',features:['Orders','Warehouse','Procurement','Reports']},
{slug:'car-dealer',title:'Car Dealership Platform',tag:'AUTOMOTIVE',description:'Vehicle listings, customer inquiries, orders, and dealer operations.',features:['Listings','Orders','CRM','Analytics']},
{slug:'gym-mis',title:'Gym Management System',tag:'FITNESS',description:'Memberships, schedules, payments, and attendance.',features:['Members','Plans','Attendance','Payments']},
{slug:'pharmacy-mis',title:'Pharmacy Management System',tag:'HEALTHCARE',description:'Inventory, batch tracking, sales, and expiry alerts.',features:['Stock','Batches','Sales','Alerts']},
] as const;
