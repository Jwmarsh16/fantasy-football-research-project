# server/app.py

from flask import Flask
from flask_jwt_extended import JWTManager
from config import app, api, db
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# JWT Setup
jwt = JWTManager(app)

# Import modularized resources
from resources.auth import RegisterResource, LoginResource, LogoutResource
from resources.user import UserResource
from resources.player import PlayerResource
from resources.review import ReviewResource
from resources.ranking import RankingResource
from resources.roster import RosterListResource, RosterResource  # added roster resources

# Serve frontend index
@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

# Register API endpoints
api.add_resource(RegisterResource, '/api/auth/register')
api.add_resource(LoginResource, '/api/auth/login')
api.add_resource(LogoutResource, '/api/auth/logout')

api.add_resource(UserResource, '/api/users', '/api/users/<int:id>')
api.add_resource(PlayerResource, '/api/players', '/api/players/<int:id>')
api.add_resource(ReviewResource, '/api/reviews', '/api/reviews/<int:id>')
api.add_resource(RankingResource, '/api/rankings', '/api/rankings/<int:id>')
# Roster endpoints for My Team feature
api.add_resource(RosterListResource, '/api/users/<int:user_id>/roster')
api.add_resource(RosterResource, '/api/roster/<int:id>')

# Entry point
if __name__ == "__main__":
    app.run(port=5555, debug=True)
