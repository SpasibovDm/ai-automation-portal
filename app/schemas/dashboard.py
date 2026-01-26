from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_leads: int
    new_leads: int
    emails_received: int
