import logging
from dataclasses import dataclass
from typing import Protocol

from app.models.email_integration import EmailIntegration

logger = logging.getLogger(__name__)


class EmailProviderClient(Protocol):
    def send_email(self, *, to_email: str, subject: str, body: str) -> str:
        ...


@dataclass
class GmailClient:
    integration: EmailIntegration

    def send_email(self, *, to_email: str, subject: str, body: str) -> str:
        logger.info(
            "Simulating Gmail send",
            extra={
                "to_email": to_email,
                "subject": subject,
                "provider": "gmail",
                "integration_id": self.integration.id,
            },
        )
        return f"gmail-{self.integration.id}-{int(self.integration.updated_at.timestamp())}"


@dataclass
class OutlookClient:
    integration: EmailIntegration

    def send_email(self, *, to_email: str, subject: str, body: str) -> str:
        logger.info(
            "Simulating Outlook send",
            extra={
                "to_email": to_email,
                "subject": subject,
                "provider": "outlook",
                "integration_id": self.integration.id,
            },
        )
        return f"outlook-{self.integration.id}-{int(self.integration.updated_at.timestamp())}"


def get_email_client(integration: EmailIntegration) -> EmailProviderClient:
    provider = integration.provider.lower()
    if provider == "gmail":
        return GmailClient(integration)
    if provider in {"outlook", "microsoft365", "microsoft"}:
        return OutlookClient(integration)
    raise ValueError(f"Unsupported provider: {integration.provider}")
