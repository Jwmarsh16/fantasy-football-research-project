"""Enforce one ranking per user and player.

Revision ID: a7a6d40309c5
Revises: af52287ee6fb
"""

from alembic import op


revision = 'a7a6d40309c5'
down_revision = 'af52287ee6fb'
branch_labels = None
depends_on = None


def upgrade():
    if op.get_context().dialect.name == 'postgresql':
        op.execute('LOCK TABLE rankings IN SHARE ROW EXCLUSIVE MODE')

    # Ranks have no timestamps. The highest ID is the newest submission.
    op.execute(
        'DELETE FROM rankings WHERE id NOT IN ('
        'SELECT MAX(id) FROM rankings GROUP BY user_id, player_id)'
    )
    op.create_index(
        'uq_rankings_user_id_player_id', 'rankings', ['user_id', 'player_id'], unique=True
    )


def downgrade():
    op.drop_index('uq_rankings_user_id_player_id', table_name='rankings')
