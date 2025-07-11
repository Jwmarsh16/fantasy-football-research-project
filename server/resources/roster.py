# server/resources/roster.py

from flask_restful import Resource
from flask import request
from models import Roster
from config import db
from utils.helpers import to_dict

class RosterListResource(Resource):
    def get(self, user_id):
        entries = Roster.query.filter_by(user_id=user_id).all()
        roster_data = []
        for r in entries:
            rd = to_dict(r, ['id', 'slot', 'is_starter'])
            # include nested player info
            player = r.player
            pd = to_dict(player, [
                'id', 'name', 'position', 'team', 'stats', 'status'
            ])
            # compute average rank if available
            ranks = [rn.rank for rn in player.rankings]
            pd['average_rank'] = sum(ranks) / len(ranks) if ranks else None
            rd['player'] = pd
            roster_data.append(rd)
        # Sort starters first, then by slot
        sorted_data = sorted(
            roster_data,
            key=lambda x: (not x['is_starter'], x['slot'])
        )
        return sorted_data, 200

    def post(self, user_id):
        data = request.get_json()
        r = Roster(
            user_id=user_id,
            player_id=data['player_id'],
            slot=data['slot'],
            is_starter=data.get('is_starter', True)
        )
        db.session.add(r)
        db.session.commit()
        rd = to_dict(r, ['id', 'slot', 'is_starter'])
        pd = to_dict(r.player, ['id', 'name', 'position', 'team', 'stats', 'status'])
        ranks = [rn.rank for rn in r.player.rankings]
        pd['average_rank'] = sum(ranks) / len(ranks) if ranks else None
        rd['player'] = pd
        return rd, 201

class RosterResource(Resource):
    def put(self, id):
        r = Roster.query.get(id)
        if not r:
            return {'error': 'Roster entry not found'}, 404
        for field, value in request.get_json().items():
            setattr(r, field, value)
        db.session.commit()
        rd = to_dict(r, ['id', 'slot', 'is_starter'])
        pd = to_dict(r.player, ['id', 'name', 'position', 'team', 'stats', 'status'])
        ranks = [rn.rank for rn in r.player.rankings]
        pd['average_rank'] = sum(ranks) / len(ranks) if ranks else None
        rd['player'] = pd
        return rd, 200

    def delete(self, id):
        r = Roster.query.get(id)
        if not r:
            return {'error': 'Roster entry not found'}, 404
        db.session.delete(r)
        db.session.commit()
        return '', 204
