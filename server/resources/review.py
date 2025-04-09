# resources/review.py
from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Review
from config import db
from utils.helpers import to_dict

class ReviewResource(Resource):
    def get(self, id=None):
        if id:
            review = Review.query.get(id)
            return to_dict(review, ['id', 'content', 'user_id', 'player_id']), 200 if review else ({"error": "Review not found"}, 404)
        return [to_dict(r, ['id', 'content', 'user_id', 'player_id']) for r in Review.query.all()], 200

    def post(self):
        review = Review(**request.get_json())
        db.session.add(review)
        db.session.commit()
        return to_dict(review, ['id', 'content', 'user_id', 'player_id']), 201

    @jwt_required()
    def put(self, id):
        review = Review.query.get(id)
        if not review or review.user_id != get_jwt_identity():
            return {"error": "Unauthorized or review not found"}, 403
        for k, v in request.get_json().items():
            setattr(review, k, v)
        db.session.commit()
        return to_dict(review, ['id', 'content', 'user_id', 'player_id']), 200

    @jwt_required()
    def delete(self, id):
        review = Review.query.get(id)
        if not review or review.user_id != get_jwt_identity():
            return {"error": "Unauthorized or review not found"}, 403
        db.session.delete(review)
        db.session.commit()
        return '', 204
