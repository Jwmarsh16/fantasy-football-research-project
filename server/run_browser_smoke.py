"""Serve the built app with disposable data for the browser smoke test."""

import os
from pathlib import Path
from secrets import token_hex
from tempfile import TemporaryDirectory


def main():
    with TemporaryDirectory(prefix="ffrh-browser-") as test_dir:
        database = (Path(test_dir) / "browser.sqlite").as_posix()
        os.environ.update(
            DATABASE_URI=f"sqlite:///{database}",
            FFRH_LOCAL_DEMO="true",
            FLASK_SECRET_KEY=token_hex(32),
            JWT_SECRET_KEY=token_hex(32),
            JWT_COOKIE_SECURE="false",
            AWS_EC2_METADATA_DISABLED="true",
        )

        from app import app
        from flask_migrate import upgrade
        from seed import seed_demo

        with app.app_context():
            upgrade()
        seed_demo()
        app.run(host="127.0.0.1", port=5055, debug=False, use_reloader=False)


if __name__ == "__main__":
    main()
