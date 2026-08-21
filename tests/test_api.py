from app.extensions import db
from app.models import Farmer, Supply


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json == {"status": "ok"}


def test_farmer_registration_requires_matching_phone(client):
    invalid = client.post("/api/farmers/register", json={"ndfr_id": "NDFR-001", "calling_phone": "08000000000"})
    assert invalid.status_code == 400

    valid = client.post("/api/farmers/register", json={"ndfr_id": "NDFR-001", "calling_phone": "08030000001"})
    assert valid.status_code == 201
    assert valid.json["verified"] is True


def test_buyer_registration_uses_cac_record(client, app):
    response = client.post("/api/buyers/register", json={"cac_id": "CAC-001"})
    assert response.status_code == 201
    assert response.json["business_name"] == "Northstar Foods Ltd"
    with app.app_context():
        assert db.session.query(Farmer).count() == 0


def test_supply_service_defaults_available_quantity(client, app):
    farmer = client.post("/api/farmers/register", json={"ndfr_id": "NDFR-002", "calling_phone": "08030000002"}).json
    response = client.post("/api/supplies", json={
        "farmer_id": farmer["id"], "crop": "soybean", "unit": "kg", "quantity": 250,
        "price_per_unit": 1200, "location": "Benue", "available_date": "2026-09-01",
    })
    assert response.status_code == 201
    assert response.json["available_quantity"] == 250
    with app.app_context():
        supply = db.session.get(Supply, response.json["id"])
        assert supply.status == "available"

