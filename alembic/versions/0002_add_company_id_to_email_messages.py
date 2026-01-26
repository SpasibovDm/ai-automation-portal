"""add company_id to email_messages

Revision ID: 0002_add_company_id_to_email_messages
Revises: 0001_initial
Create Date: 2025-01-02 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_add_company_id_to_email_messages"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("email_messages") as batch_op:
        batch_op.add_column(sa.Column("company_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_email_messages_company_id",
            "companies",
            ["company_id"],
            ["id"],
        )

    op.execute(
        "UPDATE email_messages SET company_id = (SELECT id FROM companies ORDER BY id LIMIT 1) "
        "WHERE company_id IS NULL AND EXISTS (SELECT 1 FROM companies)"
    )


def downgrade() -> None:
    with op.batch_alter_table("email_messages") as batch_op:
        batch_op.drop_constraint("fk_email_messages_company_id", type_="foreignkey")
        batch_op.drop_column("company_id")
