"""add template metadata fields

Revision ID: 0004_template_fields
Revises: 0003_email_integrations_and_reply_status
Create Date: 2026-02-05 00:00:01.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "0004_template_fields"
down_revision = "0003_email_integrations_and_reply_status"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("auto_reply_templates") as batch_op:
        batch_op.add_column(sa.Column("name", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("category", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("tone", sa.String(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("auto_reply_templates") as batch_op:
        batch_op.drop_column("tone")
        batch_op.drop_column("category")
        batch_op.drop_column("name")
