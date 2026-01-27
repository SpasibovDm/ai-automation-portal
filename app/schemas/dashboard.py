from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_leads: int
    leads_today: int
    emails_today: int
    replies_sent: int
