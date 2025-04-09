# resources/player.py
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
            player_data = to_dict(player, ['id', 'name', 'position', 'team', 'stats'])
            ranks = [r.rank for r in player.rankings]
            player_data['average_rank'] = sum(ranks) / len(ranks) if ranks else None
            return player_data, 200
        return [to_dict(p, ['id', 'name', 'position', 'team', 'stats']) for p in Player.query.all()], 200

    def post(self):
        player = Player(**request.get_json())
        db.session.add(player)
        db.session.commit()
        return to_dict(player, ['id', 'name', 'position', 'team', 'stats']), 201

    def put(self, id):
        player = Player.query.get(id)
        if not player:
            return {"error": "Player not found"}, 404
        for field, value in request.get_json().items():
            setattr(player, field, value)
        db.session.commit()
        return to_dict(player, ['id', 'name', 'position', 'team', 'stats']), 200

    def delete(self, id):
        player = Player.query.get(id)
        if not player:
            return {"error": "Player not found"}, 404
        db.session.delete(player)
        db.session.commit()
        return '', 204
