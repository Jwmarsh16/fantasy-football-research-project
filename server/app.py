from flask import Flask, request, jsonify, make_response, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, unset_jwt_cookies, create_access_token, set_access_cookies
import jwt
import datetime
from functools import wraps
import bcrypt
import os
from werkzeug.utils import secure_filename
from config import PictureConfig, app, db, api, s3, S3_BUCKET_NAME  # ✅ Import s3 from config
from models import User, Player, Review, Ranking


S3_BUCKET_NAME = "fantasy-football-research-hub"
jwt = JWTManager(app)

@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# AWS profile upload utility function
def upload_to_s3(file, user_id):
    """Uploads the file to AWS S3 and returns the file key (not full URL)."""
    file_key = f"user_{user_id}/{secure_filename(file.filename)}"  # Updated variable name
    try:
        s3.upload_fileobj(
            file,
            S3_BUCKET_NAME,
            file_key,  # Using file_key instead of filename
            ExtraArgs={"ACL": "private", "ContentType": file.content_type}
        )
        return file_key  # ✅ Return only the file key (not full URL)
    except Exception as e:
        print(f"Error uploading file to S3: {e}")
        return None

# ✅ Generate Pre-Signed URL for Secure S3 Access
def generate_presigned_url(file_key):
    """Generate a pre-signed URL for accessing a file stored in S3."""
    if not file_key:
        return None

    try:
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET_NAME, 'Key': file_key},
            ExpiresIn=3600  # ✅ Link expires in 1 hour
        )
        print(f"Generated pre-signed URL: {url}")  # ✅ Debugging
        return url
    except Exception as e:
        print(f"Error generating pre-signed URL: {e}")
        return None


# ✅ Function to Delete a File from S3
def delete_from_s3(file_key):
    try:
        s3.delete_object(Bucket=S3_BUCKET_NAME, Key=file_key)
        print(f"Deleted {file_key} from S3")
    except Exception as e:
        print(f"Error deleting file from S3: {e}")



# Utility function to serialize model instances
def to_dict(instance, fields):
    """Converts a model instance into a dictionary with the specified fields."""
    return {field: getattr(instance, field) for field in fields}



# Registration Resource
class RegisterResource(Resource):
    def post(self):
        # Determine if the request is multipart/form-data (file upload) or JSON.
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

        # Check if user already exists
        if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
            return {'message': 'User already exists'}, 409

        # Hash the password using bcrypt
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        profile_pic_url = None
        if file and allowed_file(file.filename):
            profile_pic_url = upload_to_s3(file, username)

        # Create a new user with the optional profile picture
        new_user = User(
            username=username,
            email=email,
            password=hashed_password.decode('utf-8'),
            profilePic=profile_pic_url  # This will be None if no file was uploaded
        )
        db.session.add(new_user)
        db.session.commit()

        return {'message': 'User successfully registered', 'profilePic': profile_pic_url}, 201

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
            return {'message': 'Invalid credentials'}, 401

        # Use the User model's bcrypt check_password method
        if not user.check_password(password):
            print("Password does not match.")
            return {'message': 'Invalid credentials'}, 401

        # Create JWT Token using Flask-JWT-Extended
        try:
            access_token = create_access_token(identity=user.id, expires_delta=datetime.timedelta(hours=1))
        except Exception as e:
            print(f"Error creating JWT token: {e}")
            return {'message': 'Error creating token'}, 500

        # Debugging Logs
        print(f"User found: {user}")
        print(f"Creating response for user: {user.username}")

        # Create the response data as a dictionary, now including profilePic.
        response_data = {
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'profilePic': user.profilePic  # Include the profile picture URL.
            }
        }

        # Return the response data
        response = jsonify(response_data)
        # Set JWT token as an HTTP-only cookie
        set_access_cookies(response, access_token)
        # simply return the response dictionary, which Flask-RESTful will serialize to JSON.
        return response


# Logout Resource
class LogoutResource(Resource):
    @jwt_required()  # Requires a valid JWT token to access the logout endpoint
    def post(self):
        response = jsonify({"message": "Logout successful"})
        unset_jwt_cookies(response)
        return response


# User Resource
# User Resource
class UserResource(Resource):
    def get(self, id=None):
        if id:
            user = User.query.get(id)
            if user:
                print(f"🔍 [GET] Fetching user {id} from database: {user.profilePic}")

                user_data = to_dict(user, ['id', 'username', 'email', 'profilePic'])

                # ✅ Generate pre-signed URL for AWS S3 if a profile picture exists
                if user.profilePic:
                    pre_signed_url = generate_presigned_url(user.profilePic)
                    print(f"🔍 [GET] Generated pre-signed URL: {pre_signed_url}")
                    user_data['profilePic'] = pre_signed_url

                user_data['reviews'] = [to_dict(review, ['id', 'content', 'player_id']) for review in user.reviews]
                user_data['rankings'] = [to_dict(ranking, ['id', 'rank', 'player_id']) for ranking in user.rankings]

                print(f"✅ [GET] Returning user data: {user_data}")  # ✅ Log final API response
                return user_data, 200

            print(f"❌ [GET] User {id} not found.")
            return {"error": "User not found"}, 404
        
        users = User.query.all()
        return [to_dict(user, ['id', 'username', 'email', 'profilePic']) for user in users], 200

    def put(self, id):
        user = User.query.get(id)
        if not user:
            return {"error": "User not found"}, 404
    
        print(f"🔍 [PUT] Updating user {id}. Current profilePic: {user.profilePic}")
    
        if 'profilePic' in request.files:
            file = request.files['profilePic']
            if file and allowed_file(file.filename):
                ext = file.filename.rsplit('.', 1)[1].lower()
                file_key = f"user_{user.id}/{int(datetime.datetime.now().timestamp())}.{ext}"
    
                try:
                    if user.profilePic:
                        print(f"🗑️ [PUT] Deleting old profile pic: {user.profilePic}")
                        delete_from_s3(user.profilePic)
    
                    s3.upload_fileobj(
                        file,
                        S3_BUCKET_NAME,
                        file_key,
                        ExtraArgs={"ACL": "private", "ContentType": file.content_type}
                    )
    
                    print(f"✅ [PUT] Upload successful. Storing new file key: {file_key}")
                    user.profilePic = file_key
    
                except Exception as e:
                    return {"error": f"Failed to upload to S3: {str(e)}"}, 500
    
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = request.form.to_dict()
        else:
            data = request.get_json() or {}
    
        data.pop('profilePic', None)
    
        for field in data:
            setattr(user, field, data[field])
    
        db.session.commit()
    
        # ✅ Ensure the response contains a pre-signed URL
        updated_user_data = to_dict(user, ['id', 'username', 'email', 'profilePic'])
        if user.profilePic:
            updated_user_data['profilePic'] = generate_presigned_url(user.profilePic)
    
        print(f"✅ [PUT] Updated user data: {updated_user_data}")  
        return updated_user_data, 200

    @jwt_required()
    def delete(self, id):
        try:
            current_user_id = get_jwt_identity()
            user_to_delete = User.query.get(int(id))
            if current_user_id != int(id):
                print(f"❌ [DELETE] Unauthorized action. Current user: {current_user_id}, Target: {id}")
                return {"error": "Unauthorized action"}, 403

            if not user_to_delete:
                print(f"❌ [DELETE] User {id} not found.")
                return {"error": "User not found"}, 404
            
            # ✅ Delete profile picture from S3 if exists
            if user_to_delete.profilePic:
                print(f"🗑️ [DELETE] Deleting profile picture from S3: {user_to_delete.profilePic}")
                delete_from_s3(user_to_delete.profilePic)

            db.session.delete(user_to_delete)
            db.session.commit()
            print(f"✅ [DELETE] User {id} successfully deleted.")
            return {"message": "User successfully deleted"}, 200

        except ValueError:
            print(f"❌ [DELETE] Invalid user ID format: {id}")
            return {"error": "Invalid user ID format"}, 400
        except Exception as e:
            db.session.rollback()
            print(f"❌ [DELETE] Error deleting user {id}: {e}")
            return {"error": f"An error occurred: {str(e)}"}, 500


def allowed_file(filename):
    return (
        '.' in filename and 
        filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']
    )


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
api.add_resource(LogoutResource, '/api/auth/logout')
api.add_resource(UserResource, '/api/users', '/api/users/<int:id>')
api.add_resource(PlayerResource, '/api/players', '/api/players/<int:id>')
api.add_resource(ReviewResource, '/api/reviews', '/api/reviews/<int:id>')
api.add_resource(RankingResource, '/api/rankings', '/api/rankings/<int:id>')

if __name__ == "__main__":
  app.run(port=5555, debug=True)
