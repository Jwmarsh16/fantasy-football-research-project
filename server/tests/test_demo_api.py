import os
import unittest
from datetime import timedelta
from pathlib import Path
from unittest.mock import patch

from flask_jwt_extended import create_access_token
from flask_migrate import upgrade
from sqlalchemy import insert, select, text
from sqlalchemy.exc import IntegrityError

# Bind the application to an isolated database before Flask initializes its engine.
with patch.dict(
    os.environ,
    {
        "DATABASE_URI": "sqlite://",
        "FLASK_SECRET_KEY": "ffrh-unit-test-flask-secret",
        "JWT_SECRET_KEY": "ffrh-unit-test-jwt-secret",
        "JWT_COOKIE_SECURE": "false",
        "AWS_ACCESS_KEY": "test",
        "AWS_SECRET_ACCESS_KEY": "test",
        "AWS_EC2_METADATA_DISABLED": "true",
        "S3_BUCKET_NAME": "ffrh-unit-test",
        "S3_REGION": "us-east-1",
    },
):
    from app import app
    from config import db
    from models import Player, Ranking, Review, User


def setUpModule():
    with app.app_context():
        url = db.engine.url
        if url.get_backend_name() != "sqlite" or url.database not in (None, ":memory:"):
            raise RuntimeError("API tests require an in-memory SQLite database.")


class DemoApiTests(unittest.TestCase):
    password = "LocalTestPassword123!"

    @classmethod
    def setUpClass(cls):
        account = User()
        account.set_password(cls.password)
        cls.password_hash = account.password

    def setUp(self):
        with app.app_context():
            db.create_all()
            self.addCleanup(self.drop_test_tables)
            first_user = User(
                username="first",
                email="first@example.test",
                password=self.password_hash,
            )
            second_user = User(
                username="second",
                email="second@example.test",
                password=self.password_hash,
            )
            first_player = Player(name="First Player", position="QB", team="Team", stats={})
            second_player = Player(name="Second Player", position="WR", team="Team", stats={})
            db.session.add_all([first_user, second_user, first_player, second_player])
            db.session.flush()
            self.first_user_id = first_user.id
            self.second_user_id = second_user.id
            self.player_id = first_player.id
            self.other_player_id = second_player.id
            db.session.commit()

        self.client = app.test_client()

    def drop_test_tables(self):
        with app.app_context():
            db.drop_all()

    def sign_in(self, name="first"):
        client = app.test_client()
        response = client.post(
            "/api/auth/login",
            json={"email": f"{name}@example.test", "password": self.password},
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(client.get_cookie("access_token_cookie").http_only)
        return client, {"X-CSRF-TOKEN": client.get_cookie("csrf_access_token").value}

    def test_rank_and_review_writes_require_authentication_and_csrf(self):
        signed_in, _ = self.sign_in()
        bodies = {
            "/api/rankings": {"player_id": self.player_id, "rank": 1},
            "/api/reviews": {"player_id": self.player_id, "content": "Sample review"},
        }
        for path, body in bodies.items():
            with self.subTest(path=path):
                self.assertEqual(self.client.get(path).status_code, 200)
                self.assertEqual(self.client.post(path, json=body).status_code, 401)
                self.assertEqual(signed_in.post(path, json=body).status_code, 401)
                invalid_csrf = {"X-CSRF-TOKEN": "wrong-token"}
                self.assertEqual(signed_in.post(path, json=body, headers=invalid_csrf).status_code, 401)
        with app.app_context():
            self.assertEqual(Ranking.query.count(), 0)
            self.assertEqual(Review.query.count(), 0)

    def test_rank_save_uses_session_identity_and_updates_one_row(self):
        signed_in, headers = self.sign_in()
        body = {"player_id": self.player_id, "rank": 1, "user_id": self.second_user_id}
        first = signed_in.post("/api/rankings", json=body, headers=headers)
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first.json["user_id"], self.first_user_id)

        retry = signed_in.post("/api/rankings", json=body, headers=headers)
        self.assertEqual(retry.status_code, 200)
        self.assertEqual(retry.json, first.json)

        update = signed_in.post("/api/rankings", json={**body, "rank": 2}, headers=headers)
        self.assertEqual(update.status_code, 200)
        self.assertEqual(update.json, {**first.json, "rank": 2})
        self.assertEqual(self.client.get("/api/rankings").json, [update.json])
        self.assertEqual(self.client.get("/api/reviews").json, [])

    def test_reviews_can_be_posted_without_rank_and_cannot_be_spoofed(self):
        signed_in, headers = self.sign_in()
        response = signed_in.post(
            "/api/reviews",
            json={
                "player_id": self.player_id,
                "content": "A review without a ranking",
                "user_id": self.second_user_id,
            },
            headers=headers,
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json["user_id"], self.first_user_id)
        self.assertEqual(self.client.get("/api/rankings").json, [])

    def test_only_owners_can_update_or_delete_ranks_and_reviews(self):
        owner, owner_headers = self.sign_in()
        other, other_headers = self.sign_in("second")
        resources = {
            "/api/rankings": ({"rank": 1}, {"rank": 2}),
            "/api/reviews": ({"content": "Original review"}, {"content": "Revised review"}),
        }
        for path, (initial, edit) in resources.items():
            with self.subTest(path=path):
                response = owner.post(
                    path,
                    json={**initial, "player_id": self.player_id},
                    headers=owner_headers,
                )
                self.assertIn(response.status_code, (200, 201))
                record = f"{path}/{response.json['id']}"
                self.assertEqual(other.put(record, json=edit, headers=other_headers).status_code, 403)
                self.assertEqual(other.delete(record, headers=other_headers).status_code, 403)
                self.assertEqual(self.client.get(record).json, response.json)

                update = owner.put(
                    record,
                    json={
                        **edit,
                        "user_id": self.second_user_id,
                        "player_id": self.other_player_id,
                    },
                    headers=owner_headers,
                )
                self.assertEqual(update.status_code, 200)
                self.assertEqual(update.json, {**response.json, **edit})
                self.assertEqual(owner.delete(record, headers=owner_headers).status_code, 204)

    def test_rank_save_rejects_invalid_rank_and_unknown_player(self):
        signed_in, headers = self.sign_in()
        for rank in (True, 1.5, 0, 3, "invalid"):
            with self.subTest(rank=rank):
                response = signed_in.post(
                    "/api/rankings", json={"rank": rank, "player_id": self.player_id}, headers=headers
                )
                self.assertEqual(response.status_code, 400)

        response = signed_in.post(
            "/api/rankings",
            json={"rank": 1, "player_id": self.other_player_id + 1},
            headers=headers,
        )
        self.assertEqual(response.status_code, 404)

    def test_profile_and_roster_writes_require_ownership(self):
        owner, owner_headers = self.sign_in()
        profile = f"/api/users/{self.first_user_id}"
        edit = {"username": "updated"}
        self.assertEqual(self.client.put(profile, json=edit).status_code, 401)
        self.assertEqual(owner.put(profile, json=edit).status_code, 401)
        other_profile = f"/api/users/{self.second_user_id}"
        self.assertEqual(owner.put(other_profile, json=edit, headers=owner_headers).status_code, 403)
        self.assertEqual(owner.put(profile, json=edit, headers=owner_headers).status_code, 200)

        roster = f"/api/users/{self.first_user_id}/roster"
        body = {"player_id": self.player_id, "slot": "FLEX", "is_starter": False}
        self.assertEqual(self.client.post(roster, json=body).status_code, 401)
        self.assertEqual(owner.post(roster, json=body).status_code, 401)
        response = owner.post(roster, json=body, headers=owner_headers)
        self.assertEqual(response.status_code, 201)
        record = f"/api/roster/{response.json['id']}"

        other, other_headers = self.sign_in("second")
        self.assertEqual(other.post(roster, json=body, headers=other_headers).status_code, 403)
        self.assertEqual(other.delete(record, headers=other_headers).status_code, 403)
        self.assertEqual(owner.delete(record, headers=owner_headers).status_code, 204)

    def test_player_catalog_is_public_and_read_only(self):
        player = f"/api/players/{self.player_id}"
        self.assertEqual(self.client.get("/api/players").status_code, 200)
        self.assertEqual(self.client.post("/api/players", json={}).status_code, 405)
        self.assertEqual(self.client.put(player, json={"name": "Edited"}).status_code, 405)
        self.assertEqual(self.client.delete(player).status_code, 405)
        self.assertEqual(self.client.get(player).json["name"], "First Player")

    def test_session_restores_user_from_cookie_and_is_not_cached(self):
        absent = self.client.get("/api/auth/session")
        self.assertEqual(absent.status_code, 200)
        self.assertEqual(absent.json, {"user": None})
        self.assertTrue(absent.cache_control.no_store)

        signed_in, headers = self.sign_in()
        restored = signed_in.get("/api/auth/session")
        self.assertEqual(restored.status_code, 200)
        self.assertEqual(restored.json["user"]["id"], self.first_user_id)
        self.assertNotIn("password", restored.json["user"])
        self.assertTrue(restored.cache_control.no_store)

        self.assertEqual(signed_in.post("/api/auth/logout", headers=headers).status_code, 200)
        self.assertEqual(signed_in.get("/api/auth/session").json, {"user": None})

        with app.app_context():
            expired = create_access_token(
                identity=str(self.first_user_id), expires_delta=timedelta(minutes=-1)
            )
        signed_in.set_cookie("access_token_cookie", expired)
        self.assertEqual(signed_in.get("/api/auth/session").status_code, 401)

    def test_legacy_unhashed_password_is_rejected_without_server_error(self):
        with app.app_context():
            db.session.add(
                User(username="legacy", email="legacy@example.test", password="legacy-seed-password")
            )
            db.session.commit()
        response = self.client.post(
            "/api/auth/login",
            json={"email": "legacy@example.test", "password": "legacy-seed-password"},
        )
        self.assertEqual(response.status_code, 401)


class RankingMigrationTests(unittest.TestCase):
    def test_upgrade_keeps_latest_rank_and_adds_unique_constraint(self):
        migrations = str(Path(__file__).resolve().parents[1] / "migrations")
        self.addCleanup(self.drop_migrated_tables)
        with app.app_context():
            upgrade(directory=migrations, revision="af52287ee6fb")
            first_user = User(username="first", email="first@example.test", password="unused")
            second_user = User(username="second", email="second@example.test", password="unused")
            player = Player(name="Fixture Player", position="QB", team="Team", stats={})
            db.session.add_all([first_user, second_user, player])
            db.session.flush()
            legacy_pair = {"user_id": first_user.id, "player_id": player.id}
            other_pair = {"user_id": second_user.id, "player_id": player.id}
            ranking_table = Ranking.__table__
            db.session.execute(
                insert(ranking_table),
                [
                    {"id": 1, "rank": 3, **legacy_pair},
                    {"id": 2, "rank": 4, **other_pair},
                    {"id": 3, "rank": 5, **legacy_pair},
                ],
            )
            db.session.commit()

            upgrade(directory=migrations)
            remaining = db.session.execute(
                select(ranking_table.c.id, ranking_table.c.rank).order_by(ranking_table.c.id)
            ).all()
            self.assertEqual(remaining, [(2, 4), (3, 5)])
            with self.assertRaises(IntegrityError):
                db.session.execute(insert(ranking_table).values(rank=6, **legacy_pair))
            db.session.rollback()

    def drop_migrated_tables(self):
        with app.app_context():
            db.drop_all()
            with db.engine.begin() as connection:
                connection.execute(text("DROP TABLE IF EXISTS alembic_version"))
