from config import app, db
from faker import Faker
from random import randint, sample, choice as rc
from models import db, User, Player, Review, Ranking

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        db.drop_all()
        db.create_all()

        def create_users():
            users = []
            for _ in range(10):  # Seeding only 10 initial users
                user = User(
                    username=fake.user_name()[:20],
                    email=fake.email()[:50],
                    password=fake.password()[:20]
                )
                users.append(user)
                db.session.add(user)
            db.session.commit()
            return users  # Return only the initially seeded users

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
            position_counts = {pos: 0 for pos in positions}  # Track number of players per position
            while any(count < 5 for count in position_counts.values()):
                position = rc(positions)
                if position_counts[position] < 5:
                    player = Player(
                        name=fake.name()[:50],
                        position=position,
                        team=rc(teams),
                        stats={
                            "games_played": randint(10, 16),
                            "touchdowns": randint(0, 20),
                            "yards": randint(0, 2000)
                        }
                    )
                    players.append(player)
                    db.session.add(player)
                    position_counts[position] += 1
            db.session.commit()
            return players

        def create_reviews(seed_users, players):
            reviews = []
            for _ in range(50):  # Limit to initial seed users only
                review = Review(
                    content=fake.text(max_nb_chars=200),
                    user_id=rc(seed_users).id,
                    player_id=rc(players).id
                )
                reviews.append(review)
                db.session.add(review)
            db.session.commit()
            return reviews

        def create_rankings(seed_users, players):
            rankings = []
            for user in seed_users:  # Only use initially seeded users
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

        # Create initial users and players
        seeded_users = create_users()
        players = create_players()

        # Pass only the initially seeded users to avoid auto-adding for new users
        create_reviews(seeded_users, players)
        create_rankings(seeded_users, players)