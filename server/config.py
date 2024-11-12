from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_restful import Api
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

naming_convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=naming_convention)
#Development
#app = Flask(__name__)

#Deployment
app = Flask(
    __name__,
    static_url_path='',
    static_folder='../client/dist',
    template_folder='../client/dist'
)

app.secret_key = os.getenv("FLASK_SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config['JWT_SECRET_KEY'] = 'your_secret_key'  # Replace with a secure secret key
app.config['JWT_TOKEN_LOCATION'] = ['cookies']  # Store the JWT in cookies
app.config['JWT_ACCESS_COOKIE_PATH'] = '/'  # Define the path for which cookies are valid
app.config['JWT_COOKIE_CSRF_PROTECT'] = True  # Disable CSRF protection for development (enable in production)
app.config['JWT_COOKIE_SECURE'] = True  # Set to True in production (only send cookies over HTTPS)

db = SQLAlchemy(app=app, metadata=metadata)

migrate = Migrate(app=app, db=db)

bcrypt = Bcrypt(app=app)

api = Api(app=app)

#Deployment
CORS(app, supports_credentials=True)

#Development
#CORS(app, supports_credentials=True, origins=["http://localhost:3000"])  # Make sure the CORS origins match your frontend URL