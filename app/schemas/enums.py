from enum import Enum


class LeadStatus(str, Enum):
    new = "new"
    contacted = "contacted"
    qualified = "qualified"
    closed = "closed"
    won = "won"
    lost = "lost"


class EmailStatus(str, Enum):
    new = "new"
    processed = "processed"
