# server/resources/player.py
# Resource definitions for Player CRUD, now serializing dates to ISO strings

from flask_restful import Resource
from flask import request
from models import Player
from config import db
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

    def post(self):
        player = Player(**request.get_json())
        db.session.add(player)
        db.session.commit()
        result = to_dict(player, [
            'id', 'name', 'position', 'team',
            'height', 'weight', 'birthdate',
            'college', 'draft_info', 'status',
            'stats'
        ])
        if result.get('birthdate'):
            result['birthdate'] = result['birthdate'].isoformat()
        return result, 201

    def put(self, id):
        player = Player.query.get(id)
        if not player:
            return {"error": "Player not found"}, 404
        for field, value in request.get_json().items():
            setattr(player, field, value)
        db.session.commit()
        result = to_dict(player, [
            'id', 'name', 'position', 'team',
            'height', 'weight', 'birthdate',
            'college', 'draft_info', 'status',
            'stats'
        ])
        if result.get('birthdate'):
            result['birthdate'] = result['birthdate'].isoformat()
        return result, 200

    def delete(self, id):
        player = Player.query.get(id)
        if not player:
            return {"error": "Player not found"}, 404
        db.session.delete(player)
        db.session.commit()
        return '', 204
