from datetime import date

from pydantic import BaseModel


class LeadTrendPoint(BaseModel):
    date: date
    count: int


class EmailCategoryBreakdown(BaseModel):
    category: str
    count: int


class AnalyticsOverview(BaseModel):
    emails_processed: int
    emails_auto_replied: int
    leads_generated: int
    ai_accuracy: float
    time_saved_hours: float
    edited_rate: float
    lead_trend: list[LeadTrendPoint]
    email_category_breakdown: list[EmailCategoryBreakdown]
