# resources/ranking.py
from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Ranking
from config import db
from utils.helpers import to_dict

class RankingResource(Resource):
    def get(self, id=None):
        if id:
            ranking = Ranking.query.get(id)
            return to_dict(ranking, ['id', 'rank', 'user_id', 'player_id']), 200 if ranking else ({"error": "Ranking not found"}, 404)
        return [to_dict(r, ['id', 'rank', 'user_id', 'player_id']) for r in Ranking.query.all()], 200

    def post(self):
        data = request.get_json()
        ranking = Ranking(**data)
        db.session.add(ranking)
        db.session.commit()
        return to_dict(ranking, ['id', 'rank', 'user_id', 'player_id']), 201

    @jwt_required()
    def put(self, id):
        ranking = Ranking.query.get(id)
        if not ranking or ranking.user_id != get_jwt_identity():
            return {"error": "Unauthorized or ranking not found"}, 403
        for k, v in request.get_json().items():
            setattr(ranking, k, v)
        db.session.commit()
        return to_dict(ranking, ['id', 'rank', 'user_id', 'player_id']), 200

    @jwt_required()
    def delete(self, id):
        ranking = Ranking.query.get(id)
        if not ranking or ranking.user_id != get_jwt_identity():
            return {"error": "Unauthorized or ranking not found"}, 403
        db.session.delete(ranking)
        db.session.commit()
        return '', 204
