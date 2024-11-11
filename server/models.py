from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import validates
from config import db
import bcrypt

# Models go here!

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)  # Increased password length for hashed passwords
    reviews = db.relationship('Review', back_populates='user', cascade='all, delete-orphan')
    rankings = db.relationship('Ranking', back_populates='user', cascade='all, delete-orphan')

    serialize_rules = ('-reviews.user', '-rankings.user')

    def set_password(self, password):
        """
        Set the user's password by hashing it with bcrypt.
        """
        self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        """
        Check the user's password against the stored hash.
        """
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

class Player(db.Model):
    __tablename__ = 'players'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(40), nullable=False)
    position = db.Column(db.String(20), nullable=False)
    team = db.Column(db.String(20), nullable=False)
    stats = db.Column(db.JSON, nullable=False)
    reviews = db.relationship('Review', back_populates='player', cascade='all, delete-orphan')
    rankings = db.relationship('Ranking', back_populates='player', cascade='all, delete-orphan')

    serialize_rules = ('-reviews.player', '-rankings.player')

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    user = db.relationship('User', back_populates='reviews')
    player = db.relationship('Player', back_populates='reviews')

    serialize_rules = ('-user.reviews', '-player.reviews')

class Ranking(db.Model):
    __tablename__ = 'rankings'
    id = db.Column(db.Integer, primary_key=True)
    rank = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    user = db.relationship('User', back_populates='rankings')
    player = db.relationship('Player', back_populates='rankings')

    serialize_rules = ('-user.rankings', '-player.rankings')

    @validates('rank')
    def validate_rank(self, key, rank):
        total_players = Player.query.count()
        rank = int(rank)
        if rank < 1 or rank > total_players:
            raise ValueError(f"Rank must be between 1 and {total_players}")
        return rank
