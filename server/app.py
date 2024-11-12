
from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, unset_jwt_cookies, create_access_token, set_access_cookies
import jwt
import datetime
from functools import wraps
import bcrypt
import os

from config import app, db, api
from models import User, Player, Review, Ranking

jwt = JWTManager(app)

@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

# Utility function to serialize model instances
def to_dict(instance, fields):
    return {field: getattr(instance, field) for field in fields}



# Registration Resource
class RegisterResource(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('name')
        email = data.get('email')
        password = data.get('password')

        # Check if user already exists
        if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
            return {'message': 'User already exists'}, 409

        # Hash the password using bcrypt
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Create a new user
        new_user = User(username=username, email=email, password=hashed_password.decode('utf-8'))
        db.session.add(new_user)
        db.session.commit()

        return {'message': 'User successfully registered'}, 201

# Login Resource
class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Debugging Logs
        print(f"Received login request for email: {email}")

        # Fetch the user from the database
        user = User.query.filter_by(email=email).first()
        if not user:
            print("User not found.")
            return jsonify({'message': 'Invalid credentials'}), 401

        # Use the User model's bcrypt check_password method
        if not user.check_password(password):
            print("Password does not match.")
            return jsonify({'message': 'Invalid credentials'}), 401

        # Create JWT Token using Flask-JWT-Extended
        try:
            access_token = create_access_token(identity=user.id, expires_delta=datetime.timedelta(hours=1))
        except Exception as e:
            print(f"Error creating JWT token: {e}")
            return jsonify({'message': 'Error creating token'}), 500

        # Debugging Logs
        print(f"User found: {user}")
        print(f"Creating response for user: {user.username}")

        # Set the token in a cookie using Flask-JWT-Extended utility
        try:
            response = make_response(jsonify({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }))
            # Set the JWT token in an HTTP-Only cookie
            set_access_cookies(response, access_token)
            return response, 200
        except Exception as e:
            print(f"Error creating response: {e}")
            return jsonify({'message': 'Error creating response'}), 500

# Logout Resource
class LogoutResource(Resource):
    @jwt_required()  # Requires a valid JWT token to access the logout endpoint
    def post(self):
        response = jsonify({"message": "Logout successful"})
        unset_jwt_cookies(response)
        return response, 200


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

# Adding resources to the API
api.add_resource(RegisterResource, '/api/auth/register')
api.add_resource(LoginResource, '/api/auth/login')
api.add_resource(LogoutResource, '/api/auth/logout')  # Adding LogoutResource here
api.add_resource(ProtectedResource, '/api/auth/protected')
api.add_resource(UserResource, '/api/users', '/api/users/<int:id>')
api.add_resource(PlayerResource, '/api/players', '/api/players/<int:id>')
api.add_resource(ReviewResource, '/api/reviews', '/api/reviews/<int:id>')
api.add_resource(RankingResource, '/api/rankings', '/api/rankings/<int:id>')

if __name__ == "__main__":
  app.run(port=5555, debug=True)
