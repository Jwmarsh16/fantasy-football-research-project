# server/seed.py
# Seed script: generate fake users, players, reviews, and rankings,
# now with ESPN-style player metadata and realistic stats.

from config import app, db
from faker import Faker
from random import randint, sample, choice as rc, uniform
from datetime import date
from models import User, Player, Review, Ranking

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        db.drop_all()
        db.create_all()

        def create_users():
            users = []
            for _ in range(10):
                user = User(
                    username=fake.user_name()[:20],
                    email=fake.email()[:50],
                    password=fake.password()[:20],
                    isFake=True,         # flag seeded accounts as fake
                    profilePic="avatar"  # use placeholder avatar
                )
                users.append(user)
                db.session.add(user)
            db.session.commit()
            return users

        # Core NFL player list
        nfl_players = [
            {"name": "Patrick Mahomes", "position": "QB", "team": "Kansas City Chiefs"},
            {"name": "Josh Allen", "position": "QB", "team": "Buffalo Bills"},
            {"name": "Jalen Hurts", "position": "QB", "team": "Philadelphia Eagles"},
            {"name": "Joe Burrow", "position": "QB", "team": "Cincinnati Bengals"},
            {"name": "Lamar Jackson", "position": "QB", "team": "Baltimore Ravens"},
            {"name": "Christian McCaffrey", "position": "RB", "team": "San Francisco 49ers"},
            {"name": "Derrick Henry", "position": "RB", "team": "Baltimore Ravens"},
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
            current_year = date.today().year
            for info in nfl_players:
                # Generate metadata
                birthdate = fake.date_of_birth(minimum_age=22, maximum_age=35)
                height = rc(["6'5\"", "6'3\"", "6'1\"", "5'11\"", "5'9\""])
                weight = f"{randint(180, 260)} lbs"
                college = rc(["Alabama", "Ohio State", "LSU", "Clemson", "Georgia"])
                draft_year = randint(2008, current_year)
                draft_round = randint(1, 7)
                draft_pick = randint(1, 32)
                draft_info = f"{draft_year} Rd {draft_round}, Pk {draft_pick} ({info['team']})"
                status = rc(["Active", "Injured Reserve", "Suspended"])

                # Build nested stats per category
                stats = {}

                # Passing stats
                passing_stats = {
                    "season": current_year,
                    "team": info["team"],
                    "gp": randint(10, 17),
                    "cmp": randint(200, 400),
                    "att": randint(300, 600),
                    "cmp_pct": round(uniform(50.0, 70.0), 1),
                    "yds": randint(1000, 5000),
                    "avg": round(uniform(5.0, 10.0), 1),
                    "td": randint(10, 40),
                    "int": randint(0, 20),
                    "lng": randint(20, 80),
                    "sack": randint(5, 40),
                    "rtg": round(uniform(70.0, 120.0), 1),
                    "qbr": round(uniform(20.0, 100.0), 1),
                }

                # Rushing stats
                rushing_stats = {
                    "season": current_year,
                    "team": info["team"],
                    "gp": randint(10, 17),
                    "car": randint(0, 300),
                    "yds": randint(0, 1500),
                    "avg": round(uniform(0.0, 6.0), 1),
                    "td": randint(0, 20),
                    "lng": randint(5, 80),
                    "fd": randint(0, 50),
                    "fum": randint(0, 5),
                }

                # Receiving stats
                receiving_stats = {
                    "season": current_year,
                    "team": info["team"],
                    "gp": randint(10, 17),
                    "rec": randint(0, 150),
                    "tgts": randint(0, 200),
                    "yds": randint(0, 2000),
                    "avg": round(uniform(0.0, 20.0), 1),
                    "td": randint(0, 15),
                    "lng": randint(5, 80),
                    "fd": randint(0, 60),
                    "fum": randint(0, 5),
                }

                pos = info["position"]
                # Assign only relevant stats per position
                if pos == "QB":
                    stats["passing"] = passing_stats
                    stats["rushing"] = rushing_stats
                    stats["receiving"] = { **receiving_stats, **{k: 0 for k in ["rec","tgts","yds","avg","td","lng","fd","fum"]} }
                elif pos == "RB":
                    stats["passing"] = { **passing_stats, **{k: 0 for k in ["cmp","att","cmp_pct","yds","avg","td","int","lng","sack","rtg","qbr"]} }
                    stats["rushing"] = rushing_stats
                    stats["receiving"] = receiving_stats
                elif pos in ["WR", "TE"]:
                    stats["passing"] = { **passing_stats, **{k: 0 for k in ["cmp","att","cmp_pct","yds","avg","td","int","lng","sack","rtg","qbr"]} }
                    stats["rushing"] = { **rushing_stats, **{k: 0 for k in ["car","yds","avg","td","lng","fd","fum"]} }
                    stats["receiving"] = receiving_stats
                else:
                    # Fallback: all zeros
                    stats["passing"] = { **passing_stats, **{k: 0 for k in ["cmp","att","cmp_pct","yds","avg","td","int","lng","sack","rtg","qbr"]} }
                    stats["rushing"] = { **rushing_stats, **{k: 0 for k in ["car","yds","avg","td","lng","fd","fum"]} }
                    stats["receiving"] = { **receiving_stats, **{k: 0 for k in ["rec","tgts","yds","avg","td","lng","fd","fum"]} }

                player = Player(
                    name=info["name"],
                    position=pos,
                    team=info["team"],
                    height=height,
                    weight=weight,
                    birthdate=birthdate,
                    college=college,
                    draft_info=draft_info,
                    status=status,
                    stats=stats
                )
                players.append(player)
                db.session.add(player)

            db.session.commit()
            return players

        def create_reviews(seed_users, players):
            for _ in range(50):
                review = Review(
                    content=fake.text(max_nb_chars=200),
                    user_id=rc(seed_users).id,
                    player_id=rc(players).id
                )
                db.session.add(review)
            db.session.commit()

        def create_rankings(seed_users, players):
            for user in seed_users:
                player_ids = [p.id for p in players]
                sample_ranks = sample(range(1, len(players) + 1), len(players))
                for idx, pid in enumerate(player_ids):
                    ranking = Ranking(
                        rank=sample_ranks[idx],
                        user_id=user.id,
                        player_id=pid
                    )
                    db.session.add(ranking)
            db.session.commit()

        # Run all creation functions
        seeded_users = create_users()
        players = create_players()
        create_reviews(seeded_users, players)
        create_rankings(seeded_users, players)
        print("Seeding complete!")
