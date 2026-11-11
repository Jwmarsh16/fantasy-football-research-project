# resources/user.py
from uuid import uuid4

from boto3.exceptions import S3UploadFailedError
from botocore.exceptions import BotoCoreError, ClientError
from flask import abort, request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from models import User
from config import db, s3, S3_BUCKET_NAME
from utils.s3 import allowed_file, delete_from_s3, generate_presigned_url
from utils.helpers import to_dict

class UserResource(Resource):
    def get(self, id=None):
        if id:
            user = User.query.get(id)
            if not user:
                return {"error": "User not found"}, 404
            user_data = to_dict(user, ['id', 'username', 'email', 'profilePic', 'isFake'])
            if user.profilePic:
                user_data['profilePic'] = "avatar" if user.isFake and user.profilePic == "avatar" else generate_presigned_url(user.profilePic)
            user_data['reviews'] = [to_dict(r, ['id', 'content', 'player_id']) for r in user.reviews]
            user_data['rankings'] = [to_dict(r, ['id', 'rank', 'player_id']) for r in user.rankings]
            return user_data, 200

        users = User.query.all()
        return [
            {
                **to_dict(u, ['id', 'username', 'email', 'profilePic', 'isFake']),
                'profilePic': "avatar" if u.isFake and u.profilePic == "avatar" else generate_presigned_url(u.profilePic) if u.profilePic else None
            } for u in users
        ], 200

    @jwt_required()
    def put(self, id=None):
        if id is None:
            abort(405)
        if int(get_jwt_identity()) != id:
            return {"error": "Unauthorized action"}, 403
        user = db.session.get(User, id)
        if not user:
            return {"error": "User not found"}, 404

        data = request.form if request.mimetype == 'multipart/form-data' else request.get_json(silent=True)
        if not isinstance(data, dict):
            return {"error": "Profile fields or an image file are required"}, 400

        if 'username' in data:
            username = data['username']
            if not isinstance(username, str) or not 0 < len(username.strip()) <= 40:
                return {"error": "Username must contain between 1 and 40 characters"}, 400
            user.username = username.strip()
        if 'email' in data:
            email = data['email']
            if not isinstance(email, str) or '@' not in email or len(email.strip()) > 50:
                return {"error": "A valid email is required"}, 400
            user.email = email.strip()

        previous_file = user.profilePic
        file_key = None
        file = request.files.get('profilePic')
        if file is not None:
            if not file.filename or not allowed_file(file.filename):
                return {"error": "Unsupported profile image"}, 400
            if not S3_BUCKET_NAME:
                return {"error": "Profile image storage is unavailable"}, 503
            ext = file.filename.rsplit('.', 1)[1].lower()
            file_key = f"user_{user.id}/{uuid4().hex}.{ext}"
            try:
                s3.upload_fileobj(
                    file, S3_BUCKET_NAME, file_key,
                    ExtraArgs={"ACL": "private", "ContentType": file.content_type},
                )
            except (BotoCoreError, ClientError, S3UploadFailedError):
                return {"error": "Profile image could not be uploaded"}, 502
            user.profilePic = file_key

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            if file_key:
                delete_from_s3(file_key)
            return {"error": "Username or email is already in use"}, 409
        if file_key and previous_file and previous_file != 'avatar':
            delete_from_s3(previous_file)

        updated_user_data = to_dict(user, ['id', 'username', 'email', 'profilePic'])
        if user.profilePic:
            updated_user_data['profilePic'] = "avatar" if user.isFake and user.profilePic == "avatar" else generate_presigned_url(user.profilePic)
        return updated_user_data, 200

    @jwt_required()
    def delete(self, id=None):
        if id is None:
            abort(405)
        if int(get_jwt_identity()) != id:
            return {"error": "Unauthorized action"}, 403

        user = db.session.get(User, id)
        if not user:
            return {"error": "User not found"}, 404

        previous_file = user.profilePic
        db.session.delete(user)
        db.session.commit()
        if previous_file and previous_file != 'avatar':
            delete_from_s3(previous_file)
        return {"message": "User successfully deleted"}, 200
