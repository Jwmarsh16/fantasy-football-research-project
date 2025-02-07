from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_restful import Api
from flask_cors import CORS
from dotenv import load_dotenv
import os
import boto3

# Load environment variables
load_dotenv()

# Database Naming Conventions
naming_convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=naming_convention)

# Development
#app = Flask(__name__)

# Production
app = Flask(
    __name__,
    static_url_path='',
    static_folder='../client/dist',
    template_folder='../client/dist'
)

# Secret keys & configuration
app.secret_key = os.getenv("FLASK_SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')  
app.config['JWT_TOKEN_LOCATION'] = ['cookies']  
app.config['JWT_ACCESS_COOKIE_PATH'] = '/'  
app.config['JWT_COOKIE_CSRF_PROTECT'] = True  
app.config['JWT_COOKIE_SECURE'] = True  

# AWS Configuration
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
S3_REGION = os.getenv("S3_REGION")

# Initialize Boto3 S3 Client
s3 = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=S3_REGION
)

# Configuration for profile picture uploads
class PictureConfig:
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Load PictureConfig into app config
app.config.from_object(PictureConfig)

# Database & utilities setup
db = SQLAlchemy(app=app, metadata=metadata)
migrate = Migrate(app=app, db=db)
bcrypt = Bcrypt(app=app)
api = Api(app=app)

# Production CORS configuration
CORS(app, supports_credentials=True, origins=["https://fantasy-football-research-hub.onrender.com"])

# Development CORS configuration (uncomment for local development)
#CORS(app, supports_credentials=True, origins=["http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:5555"])
