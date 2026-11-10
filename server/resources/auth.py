# resources/auth.py
from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import (
    create_access_token, get_jwt_identity, jwt_required, set_access_cookies, unset_jwt_cookies,
)
from models import User
from utils.helpers import to_dict
from utils.s3 import allowed_file, upload_to_s3
from config import db
import bcrypt
import datetime

SESSION_USER_FIELDS = ('id', 'username', 'email', 'profilePic')


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
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return {'message': 'Invalid credentials'}, 401
        email = data.get('email')
        password = data.get('password')
        if not isinstance(email, str) or not isinstance(password, str):
            return {'message': 'Invalid credentials'}, 401
        user = User.query.filter_by(email=email).first()

        try:
            valid_password = user is not None and user.check_password(password)
        except ValueError:
            # Older seed databases may contain non-bcrypt passwords.
            valid_password = False
        if not valid_password:
            return {'message': 'Invalid credentials'}, 401

        access_token = create_access_token(identity=user.id, expires_delta=datetime.timedelta(hours=1))
        response_data = {
            'message': 'Login successful',
            'user': to_dict(user, SESSION_USER_FIELDS),
        }

        response = jsonify(response_data)
        set_access_cookies(response, access_token)
        return response


class SessionResource(Resource):
    @jwt_required(optional=True)
    def get(self):
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id) if user_id is not None else None
        response = jsonify(user=to_dict(user, SESSION_USER_FIELDS) if user else None)
        response.cache_control.no_store = True
        if user_id is not None and user is None:
            unset_jwt_cookies(response)
        return response


class LogoutResource(Resource):
    @jwt_required()
    def post(self):
        response = jsonify({"message": "Logout successful"})
        unset_jwt_cookies(response)
        return response
