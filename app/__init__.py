from flask import Flask, request

from config import Config
from .extensions import db


def create_app(config_object=None):
    app = Flask(__name__)
    if isinstance(config_object, dict):
        app.config.from_object(Config)
        app.config.from_mapping(config_object)
    else:
        app.config.from_object(config_object or Config)
    db.init_app(app)

    @app.after_request
    def add_local_cors_headers(response):
        if request.path.startswith("/api/"):
            origin = request.headers.get("Origin")
            allowed_origins = app.config.get("CORS_ORIGINS", ())
            if origin and (origin in allowed_origins or "*" in allowed_origins):
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Headers"] = "Content-Type"
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
                response.headers["Access-Control-Max-Age"] = "600"
                response.headers.add("Vary", "Origin")
        return response

    from .routes import api
    app.register_blueprint(api, url_prefix="/api")

    with app.app_context():
        from . import models  # noqa: F401
        db.create_all()

    return app
