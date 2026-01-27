"""add email integrations and reply status

Revision ID: 0003_email_integrations_and_reply_status
Revises: 0002_add_chat_fields
Create Date: 2025-01-02 00:00:01.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "0003_email_integrations_and_reply_status"
down_revision = "0002_add_chat_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "email_integrations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("email_address", sa.String(), nullable=False),
        sa.Column("access_token", sa.Text(), nullable=False),
        sa.Column("refresh_token", sa.Text(), nullable=True),
        sa.Column("token_type", sa.String(), nullable=False, server_default="Bearer"),
        sa.Column("scopes", sa.Text(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="connected"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
    )
    op.create_index("ix_email_integrations_company_id", "email_integrations", ["company_id"])

    with op.batch_alter_table("email_replies") as batch_op:
        batch_op.add_column(sa.Column("send_status", sa.String(), nullable=False, server_default="pending"))
        batch_op.add_column(sa.Column("send_error", sa.Text(), nullable=True))
        batch_op.add_column(sa.Column("provider", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("provider_message_id", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("send_attempted_at", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("sent_at", sa.DateTime(), nullable=True))

    with op.batch_alter_table("leads") as batch_op:
        batch_op.add_column(sa.Column("preferred_language", sa.String(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("leads") as batch_op:
        batch_op.drop_column("preferred_language")

    with op.batch_alter_table("email_replies") as batch_op:
        batch_op.drop_column("sent_at")
        batch_op.drop_column("send_attempted_at")
        batch_op.drop_column("provider_message_id")
        batch_op.drop_column("provider")
        batch_op.drop_column("send_error")
        batch_op.drop_column("send_status")

    op.drop_index("ix_email_integrations_company_id", table_name="email_integrations")
    op.drop_table("email_integrations")
