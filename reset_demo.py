"""Reset only the local SQLite hackathon demo database and reseed it."""

from app.extensions import db
from seed import app, seed_demo


def reset_demo():
    database_uri = app.config["SQLALCHEMY_DATABASE_URI"]
    if not database_uri.startswith("sqlite:///"):
        raise RuntimeError("reset_demo.py only permits a local SQLite DATABASE_URL")
    with app.app_context():
        db.drop_all()
        db.create_all()
    buyer_id, demand_id, result = seed_demo()
    print(
        f"Demo reset: buyer_id={buyer_id} demand_id={demand_id} "
        f"gathered={result['gathered']} remaining={result['remaining']}"
    )
    return buyer_id, demand_id


if __name__ == "__main__":
    reset_demo()
