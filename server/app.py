from flask import Flask, request, jsonify
from flask_restful import Resource
import os

from config import app, db, api
from models import User, Player, Review, Ranking



class UserResource(Resource):
    def get(self, id=None):
        if id:
            user = User.query.get(id)
            if user:
                user_data = to_dict(user, ['id', 'username', 'email'])
                user_data['reviews'] = [to_dict(review, ['id', 'content', 'player_id']) for review in user.reviews]
                user_data['rankings'] = [to_dict(ranking, ['id', 'rank', 'player_id']) for ranking in user.rankings]
                return user_data, 200
            return {"error": "User not found"}, 404
        users = User.query.all()
        return [to_dict(user, ['id', 'username', 'email']) for user in users], 200

    def post(self):
        data = request.get_json()
        user = User(**data)
        db.session.add(user)
        db.session.commit()
        return to_dict(user, ['id', 'username', 'email']), 201

    def put(self, id):
        user = User.query.get(id)
        if not user:
            return {"error": "User not found"}, 404
        data = request.get_json()
        for field in data:
            setattr(user, field, data[field])
        db.session.commit()
        return to_dict(user, ['id', 'username', 'email']), 200

    def delete(self, id):
        user = User.query.get(id)
        if not user:
            return {"error": "User not found"}, 404
        db.session.delete(user)
        db.session.commit()
        return '', 204

if __name__ == "__main__":
  app.run(port=5555, debug=True)
