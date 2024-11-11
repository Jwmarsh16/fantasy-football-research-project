from config import app, db
from faker import Faker

from random import randint, sample, choice as rc

from models import db, User, Player, Review, Ranking

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        # Seed code goes here!
        db.drop_all()
        db.create_all()

        def create_users():
            users = []
            for _ in range(10):
                user = User(
                    username=fake.user_name()[:20],
                    email=fake.email()[:50],
                    password=fake.password()[:20]
                )
                users.append(user)
                db.session.add(user)
            db.session.commit()
            return users

        def create_players():
            players = []
            positions = ["QB", "RB", "WR", "TE", "K", "DEF"]
            teams = [
                "Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills",
                "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns",
                "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers",
                "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs",
                "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins",
                "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants",
                "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers",
                "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Commanders"
            ]
            for _ in range(20):
                player = Player(
                    name=fake.name()[:50],
                    position=rc(positions),
                    team=rc(teams),
                    stats={
                        "games_played": randint(10, 16),
                        "touchdowns": randint(0, 20),
                        "yards": randint(0, 2000)
                    }
                )
                players.append(player)
                db.session.add(player)
            db.session.commit()
            return players

        def create_reviews(users, players):
            reviews = []
            for _ in range(50):
                review = Review(
                    content=fake.text(max_nb_chars=200),
                    user_id=rc(users).id,
                    player_id=rc(players).id
                )
                reviews.append(review)
                db.session.add(review)
            db.session.commit()
            return reviews

        def create_rankings(users, players):
            rankings = []
            for user in users:
                player_ids = [player.id for player in players]
                sample_ranks = sample(range(1, len(players) + 1), len(players))
                for i in range(len(players)):
                    ranking = Ranking(
                        rank=sample_ranks[i],
                        user_id=user.id,
                        player_id=player_ids[i]
                    )
                    rankings.append(ranking)
                    db.session.add(ranking)
            db.session.commit()
            return rankings

        users = create_users()
        players = create_players()
        create_reviews(users, players)
        create_rankings(users, players)
    # remove pass and write your seed data