"""Added profilePic column to User model

Revision ID: c6d17a2c6058
Revises: ca40661c6438
Create Date: 2025-02-03 18:28:39.177500

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c6d17a2c6058'
down_revision = 'ca40661c6438'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('profilePic', sa.String(length=200), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('profilePic')

    # ### end Alembic commands ###
