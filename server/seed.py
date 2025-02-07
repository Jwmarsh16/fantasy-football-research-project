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
                    password=fake.password()[:20],
                    isFake=True,      # Mark this account as a seeded fake account
                    profilePic="avatar"  # Set profilePic to "avatar" so that seeded accounts display a fake avatar
                )
                users.append(user)
                db.session.add(user)
            db.session.commit()
            return users  # Return only the initially seeded users

         # List of real NFL players with their respective positions and teams
        nfl_players = [
            {"name": "Patrick Mahomes", "position": "QB", "team": "Kansas City Chiefs"},
            {"name": "Josh Allen", "position": "QB", "team": "Buffalo Bills"},
            {"name": "Jalen Hurts", "position": "QB", "team": "Philadelphia Eagles"},
            {"name": "Joe Burrow", "position": "QB", "team": "Cincinnati Bengals"},
            {"name": "Lamar Jackson", "position": "QB", "team": "Baltimore Ravens"},
            {"name": "Christian McCaffrey", "position": "RB", "team": "San Francisco 49ers"},
            {"name": "Derrick Henry", "position": "RB", "team": "Tennessee Titans"},
            {"name": "Nick Chubb", "position": "RB", "team": "Cleveland Browns"},
            {"name": "Saquon Barkley", "position": "RB", "team": "New York Giants"},
            {"name": "Jonathan Taylor", "position": "RB", "team": "Indianapolis Colts"},
            {"name": "Justin Jefferson", "position": "WR", "team": "Minnesota Vikings"},
            {"name": "Tyreek Hill", "position": "WR", "team": "Miami Dolphins"},
            {"name": "Davante Adams", "position": "WR", "team": "Las Vegas Raiders"},
            {"name": "Stefon Diggs", "position": "WR", "team": "Buffalo Bills"},
            {"name": "A.J. Brown", "position": "WR", "team": "Philadelphia Eagles"},
            {"name": "Travis Kelce", "position": "TE", "team": "Kansas City Chiefs"},
            {"name": "Mark Andrews", "position": "TE", "team": "Baltimore Ravens"},
            {"name": "George Kittle", "position": "TE", "team": "San Francisco 49ers"},
            {"name": "Darren Waller", "position": "TE", "team": "New York Giants"},
            {"name": "Kyle Pitts", "position": "TE", "team": "Atlanta Falcons"},
            {"name": "Justin Tucker", "position": "K", "team": "Baltimore Ravens"},
            {"name": "Harrison Butker", "position": "K", "team": "Kansas City Chiefs"},
            {"name": "Evan McPherson", "position": "K", "team": "Cincinnati Bengals"},
            {"name": "Tyler Bass", "position": "K", "team": "Buffalo Bills"},
            {"name": "Daniel Carlson", "position": "K", "team": "Las Vegas Raiders"},
            {"name": "Micah Parsons", "position": "DEF", "team": "Dallas Cowboys"},
            {"name": "Nick Bosa", "position": "DEF", "team": "San Francisco 49ers"},
            {"name": "T.J. Watt", "position": "DEF", "team": "Pittsburgh Steelers"},
            {"name": "Aaron Donald", "position": "DEF", "team": "Los Angeles Rams"},
            {"name": "Myles Garrett", "position": "DEF", "team": "Cleveland Browns"},
            {"name": "Fred Warner", "position": "DEF", "team": "San Francisco 49ers"},
            {"name": "Jalen Ramsey", "position": "DEF", "team": "Miami Dolphins"},
            {"name": "Derwin James", "position": "DEF", "team": "Los Angeles Chargers"},
            {"name": "Sauce Gardner", "position": "DEF", "team": "New York Jets"},
            {"name": "Roquan Smith", "position": "DEF", "team": "Baltimore Ravens"}
        ]

        def create_players():
            players = []
            for player_info in nfl_players:
                player = Player(
                    name=player_info["name"],
                    position=player_info["position"],
                    team=player_info["team"],
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
