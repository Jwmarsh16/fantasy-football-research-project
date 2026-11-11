from flask import abort, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource
from sqlalchemy.dialects import postgresql, sqlite
from sqlalchemy.exc import IntegrityError

from config import db
from models import Player, Ranking, User
from utils.helpers import to_dict, valid_record_id


RANKING_FIELDS = ('id', 'rank', 'user_id', 'player_id')


class RankingResource(Resource):
    def get(self, id=None):
        if id is None:
            return [to_dict(ranking, RANKING_FIELDS) for ranking in Ranking.query.all()], 200
        ranking = db.session.get(Ranking, id)
        if ranking is None:
            return {"error": "Ranking not found"}, 404
        return to_dict(ranking, RANKING_FIELDS), 200

    @jwt_required()
    def post(self, id=None):
        if id is not None:
            abort(405)
        data = request.get_json(silent=True)
        if not isinstance(data, dict) or not valid_record_id(data.get('player_id')):
            return {"error": "A valid player_id is required"}, 400

        user_id = int(get_jwt_identity())
        player_id = data['player_id']
        if db.session.get(User, user_id) is None:
            return {"error": "Account not found"}, 401
        if db.session.get(Player, player_id) is None:
            return {"error": "Player not found"}, 404
        try:
            candidate = Ranking(user_id=user_id, player_id=player_id, rank=data.get('rank'))
        except ValueError as error:
            return {"error": str(error)}, 400

        # Resolve concurrent saves in the database using the user/player unique index.
        insert = sqlite.insert if db.engine.dialect.name == 'sqlite' else postgresql.insert
        statement = insert(Ranking).values(user_id=user_id, player_id=player_id, rank=candidate.rank)
        statement = statement.on_conflict_do_update(
            index_elements=[Ranking.user_id, Ranking.player_id],
            set_={'rank': statement.excluded.rank},
        ).returning(Ranking)
        try:
            ranking = db.session.scalars(statement).one()
            result = to_dict(ranking, RANKING_FIELDS)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"error": "Ranking could not be saved"}, 409
        return result, 200

    @jwt_required()
    def put(self, id=None):
        if id is None:
            abort(405)
        ranking = db.session.get(Ranking, id)
        if ranking is None or ranking.user_id != int(get_jwt_identity()):
            return {"error": "Unauthorized or ranking not found"}, 403
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return {"error": "A JSON object is required"}, 400
        try:
            ranking.rank = data.get('rank')
        except ValueError as error:
            return {"error": str(error)}, 400
        db.session.commit()
        return to_dict(ranking, RANKING_FIELDS), 200

    @jwt_required()
    def delete(self, id=None):
        if id is None:
            abort(405)
        ranking = db.session.get(Ranking, id)
        if ranking is None or ranking.user_id != int(get_jwt_identity()):
            return {"error": "Unauthorized or ranking not found"}, 403
        db.session.delete(ranking)
        db.session.commit()
        return '', 204
