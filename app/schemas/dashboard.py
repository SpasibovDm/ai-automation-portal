from datetime import datetime

from pydantic import BaseModel


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
