# resources/user.py
from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User
from config import db, s3, S3_BUCKET_NAME
from utils.s3 import allowed_file, upload_to_s3, delete_from_s3, generate_presigned_url
from utils.helpers import to_dict
import datetime

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

    def put(self, id):
        user = User.query.get(id)
        if not user:
            return {"error": "User not found"}, 404

        if 'profilePic' in request.files:
            file = request.files['profilePic']
            if file and allowed_file(file.filename):
                ext = file.filename.rsplit('.', 1)[1].lower()
                file_key = f"user_{user.id}/{int(datetime.datetime.now().timestamp())}.{ext}"
                if user.profilePic:
                    delete_from_s3(user.profilePic)
                s3.upload_fileobj(file, S3_BUCKET_NAME, file_key, ExtraArgs={"ACL": "private", "ContentType": file.content_type})
                user.profilePic = file_key

        data = request.form.to_dict() if 'multipart/form-data' in request.content_type else (request.get_json() or {})
        data.pop('profilePic', None)
        for key, value in data.items():
            setattr(user, key, value)
        db.session.commit()

        updated_user_data = to_dict(user, ['id', 'username', 'email', 'profilePic'])
        if user.profilePic:
            updated_user_data['profilePic'] = generate_presigned_url(user.profilePic)
        return updated_user_data, 200

    @jwt_required()
    def delete(self, id):
        current_user_id = get_jwt_identity()
        if current_user_id != id:
            return {"error": "Unauthorized action"}, 403

        user = User.query.get(id)
        if not user:
            return {"error": "User not found"}, 404

        if user.profilePic:
            delete_from_s3(user.profilePic)
        db.session.delete(user)
        db.session.commit()
        return {"message": "User successfully deleted"}, 200
