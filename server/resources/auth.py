# resources/auth.py
from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import create_access_token, set_access_cookies, unset_jwt_cookies, jwt_required
from models import User
from utils.helpers import to_dict
from utils.s3 import allowed_file, upload_to_s3
from config import db
import bcrypt
import datetime

class RegisterResource(Resource):
    def post(self):
        if request.content_type and 'multipart/form-data' in request.content_type:
            username = request.form.get('name')
            email = request.form.get('email')
            password = request.form.get('password')
            file = request.files.get('profilePic')
        else:
            data = request.get_json()
            username = data.get('name')
            email = data.get('email')
            password = data.get('password')
            file = None

        if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
            return {'message': 'User already exists'}, 409

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        profile_pic_url = upload_to_s3(file, username) if file and allowed_file(file.filename) else None

        new_user = User(username=username, email=email, password=hashed_password.decode('utf-8'), profilePic=profile_pic_url)
        db.session.add(new_user)
        db.session.commit()

        return {'message': 'User successfully registered', 'profilePic': profile_pic_url}, 201

class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return {'message': 'Invalid credentials'}, 401

        access_token = create_access_token(identity=user.id, expires_delta=datetime.timedelta(hours=1))
        response_data = {
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'profilePic': user.profilePic
            }
        }

        response = jsonify(response_data)
        set_access_cookies(response, access_token)
        return response

class LogoutResource(Resource):
    @jwt_required()
    def post(self):
        response = jsonify({"message": "Logout successful"})
        unset_jwt_cookies(response)
        return response
