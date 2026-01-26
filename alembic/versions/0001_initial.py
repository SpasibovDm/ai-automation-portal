"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2025-01-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "companies",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "leads",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("message", sa.String(), nullable=True),
        sa.Column("source", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
    )
    op.create_index("ix_leads_email", "leads", ["email"])

    op.create_table(
        "email_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("from_email", sa.String(), nullable=False),
        sa.Column("subject", sa.String(), nullable=False),
        sa.Column("body", sa.String(), nullable=False),
        sa.Column("received_at", sa.DateTime(), nullable=False),
        sa.Column("processed", sa.Boolean(), nullable=False),
        sa.Column("lead_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"]),
    )
    op.create_index("ix_email_messages_from_email", "email_messages", ["from_email"])

    op.create_table(
        "auto_reply_templates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("trigger_type", sa.String(), nullable=False),
        sa.Column("subject_template", sa.String(), nullable=False),
        sa.Column("body_template", sa.String(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
    )

    op.execute(
        "UPDATE auto_reply_templates SET company_id = (SELECT id FROM companies ORDER BY id LIMIT 1) "
        "WHERE company_id IS NULL AND EXISTS (SELECT 1 FROM companies)"
    )


def downgrade() -> None:
    op.drop_table("auto_reply_templates")
    op.drop_index("ix_email_messages_from_email", table_name="email_messages")
    op.drop_table("email_messages")
    op.drop_index("ix_leads_email", table_name="leads")
    op.drop_table("leads")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.drop_table("companies")
