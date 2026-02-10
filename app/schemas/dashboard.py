from datetime import datetime

from pydantic import BaseModel

from app.schemas.analytics import EmailCategoryBreakdown, LeadTrendPoint


class DashboardStats(BaseModel):
    total_leads: int
    leads_today: int
    emails_today: int
    replies_sent: int


class DashboardActivityItem(BaseModel):
    id: int
    title: str
    detail: str | None = None
    created_at: datetime
    entity_type: str
    action: str


class DashboardUrgentItem(BaseModel):
    title: str
    detail: str
    level: str


class DashboardActivityResponse(BaseModel):
    ai_activity: list[DashboardActivityItem]
    recent_activity: list[DashboardActivityItem]


class DashboardUrgentResponse(BaseModel):
    items: list[DashboardUrgentItem]


class DashboardKpis(BaseModel):
    total_leads: int
    leads_today: int
    emails_processed: int
    ai_replies_sent: int
    pending_actions: int
    emails_processed_30d: int
    ai_replies_sent_30d: int
    leads_generated_30d: int


class LeadStatusFunnelItem(BaseModel):
    status: str
    count: int
    percentage: float


class DashboardCharts(BaseModel):
    lead_trend: list[LeadTrendPoint]
    email_category_breakdown: list[EmailCategoryBreakdown]
    lead_status_funnel: list[LeadStatusFunnelItem]


class DashboardSummary(BaseModel):
    kpis: DashboardKpis
    charts: DashboardCharts
    recent_activity: list[DashboardActivityItem]
