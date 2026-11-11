# server/app.py

from flask_jwt_extended import JWTManager
from config import app, api
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# JWT Setup
jwt = JWTManager(app)

# Import modularized resources
from resources.auth import RegisterResource, LoginResource, LogoutResource, SessionResource
from resources.user import UserResource
from resources.player import PlayerResource
from resources.review import ReviewResource
from resources.ranking import RankingResource
from resources.roster import RosterListResource, RosterResource  # added roster resources

# Serve the React routes without masking missing API endpoints or static files.
@app.route('/')
@app.route('/players', strict_slashes=False)
@app.route('/players/compare', strict_slashes=False)
@app.route('/players/<int:player_id>', strict_slashes=False)
@app.route('/add-review/<int:player_id>', strict_slashes=False)
@app.route('/profile', strict_slashes=False)
@app.route('/profile/<int:user_id>', strict_slashes=False)
@app.route('/users', strict_slashes=False)
@app.route('/register', strict_slashes=False)
@app.route('/login', strict_slashes=False)
def serve_index(**_route_params):
    return app.send_static_file('index.html')

# Register API endpoints
api.add_resource(RegisterResource, '/api/auth/register')
api.add_resource(LoginResource, '/api/auth/login')
api.add_resource(LogoutResource, '/api/auth/logout')
api.add_resource(SessionResource, '/api/auth/session')

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
