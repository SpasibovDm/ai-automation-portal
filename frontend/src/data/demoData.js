export const demoSummary = {
  kpis: {
    leads_today: 18,
    total_leads: 1243,
    emails_processed: 142,
    emails_processed_30d: 3280,
    ai_replies_sent: 96,
    ai_replies_sent_30d: 2104,
    pending_actions: 7,
    leads_generated_30d: 468,
  },
  lead_trend: [
    { day: "Mon", leads: 32 },
    { day: "Tue", leads: 28 },
    { day: "Wed", leads: 44 },
    { day: "Thu", leads: 39 },
    { day: "Fri", leads: 52 },
    { day: "Sat", leads: 27 },
    { day: "Sun", leads: 41 },
  ],
  email_category_breakdown: [
    { category: "Sales", count: 62 },
    { category: "Support", count: 38 },
    { category: "Partners", count: 24 },
    { category: "Expansion", count: 18 },
  ],
  status_funnel: [
    { label: "New", value: 184 },
    { label: "Contacted", value: 121 },
    { label: "Qualified", value: 64 },
    { label: "Closed", value: 32 },
  ],
};

export const demoLeads = [
  {
    id: "demo-1",
    name: "Taylor Bennett",
    email: "taylor@northwindhealth.com",
    status: "qualified",
    source: "Website",
    created_at: "2026-02-08T09:24:00Z",
    score: 92,
    summary: "Asked for pricing for 200-seat rollout.",
  },
  {
    id: "demo-2",
    name: "Jordan Lee",
    email: "jordan@opensignal.io",
    status: "contacted",
    source: "Outbound",
    created_at: "2026-02-08T14:18:00Z",
    score: 80,
    summary: "Requested security docs and SOC2.",
  },
  {
    id: "demo-3",
    name: "Priya Kapoor",
    email: "priya@juniperlabs.ai",
    status: "new",
    source: "Chat",
    created_at: "2026-02-09T11:02:00Z",
    score: 67,
    summary: "Needs demo for sales + support teams.",
  },
  {
    id: "demo-4",
    name: "Marcus Chen",
    email: "marcus@bluejetworks.com",
    status: "closed",
    source: "Referral",
    created_at: "2026-02-07T16:45:00Z",
    score: 88,
    summary: "Signed annual plan, onboarding in progress.",
  },
];

export const demoEmails = [
  {
    id: "email-1",
    subject: "Need pricing for 50-seat team",
    from: "casey@cobaltmedia.com",
    status: "replied",
    category: "Sales",
    received_at: "2026-02-09T10:30:00Z",
  },
  {
    id: "email-2",
    subject: "Can you auto-triage onboarding requests?",
    from: "alex@harborhq.co",
    status: "pending",
    category: "Support",
    received_at: "2026-02-09T09:05:00Z",
  },
  {
    id: "email-3",
    subject: "Security questionnaire attached",
    from: "security@opensignal.io",
    status: "processed",
    category: "Compliance",
    received_at: "2026-02-08T17:42:00Z",
  },
  {
    id: "email-4",
    subject: "Partner integration timeline",
    from: "alliances@orbitstack.com",
    status: "replied",
    category: "Partners",
    received_at: "2026-02-08T15:10:00Z",
  },
];

export const demoActivities = [
  {
    id: "activity-1",
    title: "AI reply sent",
    description: "Follow-up sent to Northwind Health",
    time: "12 min ago",
  },
  {
    id: "activity-2",
    title: "Lead qualified",
    description: "Jordan Lee moved to Qualified stage",
    time: "38 min ago",
  },
  {
    id: "activity-3",
    title: "Inbox triaged",
    description: "12 emails categorized by AI",
    time: "1 hr ago",
  },
];
