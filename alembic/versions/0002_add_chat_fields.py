"""add chat lead fields

Revision ID: 0002_add_chat_fields
Revises: 0001_initial
Create Date: 2025-01-02 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_add_chat_fields"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("UPDATE leads SET source = 'chat' WHERE source IS NULL")
    with op.batch_alter_table("leads") as batch_op:
        batch_op.add_column(sa.Column("conversation_summary", sa.Text(), nullable=True))
        batch_op.alter_column(
            "source",
            existing_type=sa.String(),
            nullable=False,
            server_default="chat",
        )


def downgrade() -> None:
    with op.batch_alter_table("leads") as batch_op:
        batch_op.alter_column(
            "source",
            existing_type=sa.String(),
            nullable=True,
            server_default=None,
        )
        batch_op.drop_column("conversation_summary")
