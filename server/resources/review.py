from flask import abort, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError

from config import db
from models import Player, Review, User
from utils.helpers import to_dict, valid_record_id


REVIEW_FIELDS = ('id', 'content', 'user_id', 'player_id')


def valid_review_content(content):
    return isinstance(content, str) and bool(content.strip()) and len(content) <= 450


class ReviewResource(Resource):
    def get(self, id=None):
        if id is None:
            return [to_dict(review, REVIEW_FIELDS) for review in Review.query.all()], 200
        review = db.session.get(Review, id)
        if review is None:
            return {"error": "Review not found"}, 404
        return to_dict(review, REVIEW_FIELDS), 200

    @jwt_required()
    def post(self, id=None):
        if id is not None:
            abort(405)
        data = request.get_json(silent=True)
        if not isinstance(data, dict) or not valid_record_id(data.get('player_id')):
            return {"error": "A valid player_id is required"}, 400
        if not valid_review_content(data.get('content')):
            return {"error": "Review must contain between 1 and 450 characters"}, 400

        user_id = int(get_jwt_identity())
        player_id = data['player_id']
        if db.session.get(User, user_id) is None:
            return {"error": "Account not found"}, 401
        if db.session.get(Player, player_id) is None:
            return {"error": "Player not found"}, 404

        review = Review(user_id=user_id, player_id=player_id, content=data['content'])
        db.session.add(review)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"error": "Review could not be saved"}, 409
        return to_dict(review, REVIEW_FIELDS), 201

    @jwt_required()
    def put(self, id=None):
        if id is None:
            abort(405)
        review = db.session.get(Review, id)
        if review is None or review.user_id != int(get_jwt_identity()):
            return {"error": "Unauthorized or review not found"}, 403
        data = request.get_json(silent=True)
        if not isinstance(data, dict) or not valid_review_content(data.get('content')):
            return {"error": "Review must contain between 1 and 450 characters"}, 400
        review.content = data['content']
        db.session.commit()
        return to_dict(review, REVIEW_FIELDS), 200

    @jwt_required()
    def delete(self, id=None):
        if id is None:
            abort(405)
        review = db.session.get(Review, id)
        if review is None or review.user_id != int(get_jwt_identity()):
            return {"error": "Unauthorized or review not found"}, 403
        db.session.delete(review)
        db.session.commit()
        return '', 204
