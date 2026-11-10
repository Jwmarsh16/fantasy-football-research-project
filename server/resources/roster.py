from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError

from config import db
from models import Player, Roster, User
from utils.helpers import to_dict, valid_record_id


def roster_data(entry):
    data = to_dict(entry, ['id', 'slot', 'is_starter'])
    player = entry.player
    data['player'] = to_dict(player, ['id', 'name', 'position', 'team', 'stats', 'status'])
    ranks = [ranking.rank for ranking in player.rankings]
    data['player']['average_rank'] = sum(ranks) / len(ranks) if ranks else None
    return data


def roster_slot(value):
    if type(value) is int and valid_record_id(value):
        return str(value)
    if isinstance(value, str) and 0 < len(value.strip()) <= 20:
        return value.strip()
    return None


class RosterListResource(Resource):
    def get(self, user_id):
        entries = Roster.query.filter_by(user_id=user_id).all()
        # Sort starters first, then by slot.
        entries.sort(key=lambda entry: (not entry.is_starter, entry.slot))
        return [roster_data(entry) for entry in entries], 200

    @jwt_required()
    def post(self, user_id):
        current_user_id = int(get_jwt_identity())
        if current_user_id != user_id:
            return {'error': 'Unauthorized action'}, 403
        data = request.get_json(silent=True)
        if not isinstance(data, dict) or not valid_record_id(data.get('player_id')):
            return {'error': 'A valid player_id is required'}, 400
        slot = roster_slot(data.get('slot'))
        is_starter = data.get('is_starter', True)
        if slot is None or not isinstance(is_starter, bool):
            return {'error': 'A valid slot and starter flag are required'}, 400
        if db.session.get(User, current_user_id) is None:
            return {'error': 'Account not found'}, 401
        if db.session.get(Player, data['player_id']) is None:
            return {'error': 'Player not found'}, 404

        entry = Roster(
            user_id=current_user_id,
            player_id=data['player_id'],
            slot=slot,
            is_starter=is_starter,
        )
        db.session.add(entry)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {'error': 'Roster entry could not be saved'}, 409
        return roster_data(entry), 201


class RosterResource(Resource):
    @jwt_required()
    def put(self, id):
        entry = db.session.get(Roster, id)
        if entry is None:
            return {'error': 'Roster entry not found'}, 404
        if entry.user_id != int(get_jwt_identity()):
            return {'error': 'Unauthorized action'}, 403
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return {'error': 'A JSON object is required'}, 400
        slot = roster_slot(data.get('slot', entry.slot))
        is_starter = data.get('is_starter', entry.is_starter)
        if slot is None or not isinstance(is_starter, bool):
            return {'error': 'A valid slot and starter flag are required'}, 400
        entry.slot = slot
        entry.is_starter = is_starter
        db.session.commit()
        return roster_data(entry), 200

    @jwt_required()
    def delete(self, id):
        entry = db.session.get(Roster, id)
        if entry is None:
            return {'error': 'Roster entry not found'}, 404
        if entry.user_id != int(get_jwt_identity()):
            return {'error': 'Unauthorized action'}, 403
        db.session.delete(entry)
        db.session.commit()
        return '', 204
