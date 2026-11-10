# server/resources/player.py
# The public player catalog is read-only.

from flask_restful import Resource
from models import Player
from utils.helpers import to_dict

class PlayerResource(Resource):
    def get(self, id=None):
        if id:
            player = Player.query.get(id)
            if not player:
                return {"error": "Player not found"}, 404

            # Serialize player fields
            player_data = to_dict(player, [
                'id', 'name', 'position', 'team',
                'height', 'weight', 'birthdate',
                'college', 'draft_info', 'status',
                'stats'
            ])

            # Convert birthdate to ISO string if present
            if player_data.get('birthdate'):
                player_data['birthdate'] = player_data['birthdate'].isoformat()

            # Compute average rank
            ranks = [r.rank for r in player.rankings]
            player_data['average_rank'] = sum(ranks) / len(ranks) if ranks else None
            return player_data, 200

        # Bulk list view
        players = Player.query.all()
        players_data = []
        for p in players:
            pd = to_dict(p, [
                'id', 'name', 'position', 'team',
                'height', 'weight', 'birthdate',
                'college', 'draft_info', 'status',
                'stats'
            ])
            if pd.get('birthdate'):
                pd['birthdate'] = pd['birthdate'].isoformat()
            players_data.append(pd)
        return players_data, 200
