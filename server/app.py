from flask import Flask, request, jsonify
from flask_restful import Resource
import os

from config import app, db, api
from models import User, Player, Review, Ranking



@app.route('/')
def index():
    return '<h1>Project Server</h1>'

# Utility function to serialize model instances
def to_dict(instance, fields):
    return {field: getattr(instance, field) for field in fields}

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


class PlayerResource(Resource):
    def get(self, id=None):
        if id:
            player = Player.query.get(id)
            if player:
                player_data = to_dict(player, ['id', 'name', 'position', 'team', 'stats'])
                
                ranks = [ranking.rank for ranking in player.rankings]
                if ranks:
                    average_rank = sum(ranks) / len(ranks)
                else:
                    average_rank = None
                
                player_data['average_rank'] = average_rank
                return player_data, 200
            return {"error": "Player not found"}, 404
        players = Player.query.all()
        return [to_dict(player, ['id', 'name', 'position', 'team', 'stats']) for player in players], 200

    def post(self):
        data = request.get_json()
        player = Player(**data)
        db.session.add(player)
        db.session.commit()
        return to_dict(player, ['id', 'name', 'position', 'team', 'stats']), 201

    def put(self, id):
        player = Player.query.get(id)
        if not player:
            return {"error": "Player not found"}, 404
        data = request.get_json()
        for field in data:
            setattr(player, field, data[field])
        db.session.commit()
        return to_dict(player, ['id', 'name', 'position', 'team', 'stats']), 200

    def delete(self, id):
        player = Player.query.get(id)
        if not player:
            return {"error": "Player not found"}, 404
        db.session.delete(player)
        db.session.commit()
        return '', 204


class ReviewResource(Resource):
    def get(self, id=None):
        if id:
            review = Review.query.get(id)
            if review:
                return to_dict(review, ['id', 'content', 'user_id', 'player_id']), 200
            return {"error": "Review not found"}, 404
        reviews = Review.query.all()
        return [to_dict(review, ['id', 'content', 'user_id', 'player_id']) for review in reviews], 200

    def post(self):
        data = request.get_json()
        review = Review(**data)
        db.session.add(review)
        db.session.commit()
        return to_dict(review, ['id', 'content', 'user_id', 'player_id']), 201

    def put(self, id):
        review = Review.query.get(id)
        if not review:
            return {"error": "Review not found"}, 404
        data = request.get_json()
        for field in data:
            setattr(review, field, data[field])
        db.session.commit()
        return to_dict(review, ['id', 'content', 'user_id', 'player_id']), 200

    def delete(self, id):
        review = Review.query.get(id)
        if not review:
            return {"error": "Review not found"}, 404
        db.session.delete(review)
        db.session.commit()
        return '', 204

class RankingResource(Resource):
    def get(self, id=None):
        if id:
            ranking = Ranking.query.get(id)
            if ranking:
                return to_dict(ranking, ['id', 'rank', 'user_id', 'player_id']), 200
            return {"error": "Ranking not found"}, 404
        rankings = Ranking.query.all()
        return [to_dict(ranking, ['id', 'rank', 'user_id', 'player_id']) for ranking in rankings], 200

    def post(self):
        data = request.get_json()
        ranking = Ranking(
            rank=data.get('rank'),
            user_id=data.get('user_id'),
            player_id=data.get('player_id')
        )
        db.session.add(ranking)
        db.session.commit()
        return to_dict(ranking, ['id', 'rank', 'user_id', 'player_id']), 201

    def put(self, id):
        ranking = Ranking.query.get(id)
        if not ranking:
            return {"error": "Ranking not found"}, 404
        data = request.get_json()
        for field in data:
            setattr(ranking, field, data[field])
        db.session.commit()
        return to_dict(ranking, ['id', 'rank', 'user_id', 'player_id']), 200

    def delete(self, id):
        ranking = Ranking.query.get(id)
        if not ranking:
            return {"error": "Ranking not found"}, 404
        db.session.delete(ranking)
        db.session.commit()
        return '', 204

api.add_resource(UserResource, '/users', '/users/<int:id>')
api.add_resource(PlayerResource, '/players', '/players/<int:id>')
api.add_resource(ReviewResource, '/reviews', '/reviews/<int:id>')
api.add_resource(RankingResource, '/rankings', '/rankings/<int:id>')

if __name__ == "__main__":
  app.run(port=5555, debug=True)
