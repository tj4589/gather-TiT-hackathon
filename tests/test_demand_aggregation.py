from datetime import date

from app.extensions import db
from app.models import Allocation, Buyer, Demand, Farmer, Order, Supply
from app.services.demand_service import find_previous_suppliers, gather_demand


def farmer(client, ndfr_id="NDFR-001", phone="08030000001"):
    return client.post("/api/farmers/register", json={
        "ndfr_id": ndfr_id, "calling_phone": phone,
    }).json


def buyer(client):
    return client.post("/api/buyers/register", json={"cac_id": "CAC-001"}).json


def supply(client, farmer_id, **overrides):
    data = {
        "farmer_id": farmer_id, "crop": "maize", "unit": "bags", "quantity": 270,
        "price_per_unit": 40000, "location": "Kaduna", "available_date": "2026-08-20",
    }
    data.update(overrides)
    response = client.post("/api/supplies", json=data)
    assert response.status_code == 201, response.json
    return response.json


def demand(client, buyer_id, **overrides):
    data = {
        "buyer_id": buyer_id,
        "raw_text": "I need maize",
        "crop": "maize",
        "unit": "bags",
        "quantity": 500,
        "location": "Kaduna",
        "required_date": "2026-08-24",
        "max_price_per_unit": None,
    }
    data.update(overrides)
    response = client.post("/api/demands", json=data)
    assert response.status_code == 201, response.json
    return response.json


def test_partial_supply_returns_correct_values(client):
    f = farmer(client)
    b = buyer(client)
    supply(client, f["id"], quantity=270)
    result = demand(client, b["id"])
    assert result["status"] == "gathering"
    assert result["gathered"] == 270
    assert result["remaining"] == 230
    assert result["percentage"] == 54


def test_incompatible_crop_is_ignored(client):
    f = farmer(client)
    b = buyer(client)
    supply(client, f["id"], crop="rice", quantity=500)
    result = demand(client, b["id"])
    assert result["gathered"] == 0


def test_incompatible_unit_is_ignored(client):
    f = farmer(client)
    b = buyer(client)
    supply(client, f["id"], unit="kg", quantity=500)
    result = demand(client, b["id"])
    assert result["gathered"] == 0


def test_supply_after_required_date_is_ignored(client):
    f = farmer(client)
    b = buyer(client)
    supply(client, f["id"], quantity=500, available_date="2026-08-25")
    result = demand(client, b["id"])
    assert result["gathered"] == 0


def test_max_price_is_respected(client):
    f = farmer(client)
    b = buyer(client)
    supply(client, f["id"], quantity=500, price_per_unit=41000)
    result = demand(client, b["id"], max_price_per_unit=40000)
    assert result["gathered"] == 0


def test_new_supply_increases_demand_fulfillment(client):
    f1 = farmer(client)
    f2 = farmer(client, "NDFR-002", "08030000002")
    b = buyer(client)
    supply(client, f1["id"], quantity=270)
    created = demand(client, b["id"])
    supply(client, f2["id"], quantity=70)
    result = client.get(f"/api/demands/{created['demand_id']}/status").json
    assert result["gathered"] == 340
    assert result["remaining"] == 160


def test_fulfillment_creates_one_order_and_exact_allocations(client, app):
    f1 = farmer(client)
    f2 = farmer(client, "NDFR-002", "08030000002")
    b = buyer(client)
    first = supply(client, f1["id"], quantity=270, price_per_unit=40000)
    second = supply(client, f2["id"], quantity=300, price_per_unit=40500)
    created = demand(client, b["id"])
    assert created["status"] == "fulfilled"
    assert created["order_id"]
    order_response = client.get(f"/api/orders/{created['order_id']}")
    assert order_response.status_code == 200
    assert sum(item["allocated_quantity"] for item in order_response.json["allocations"]) == 500
    assert order_response.json["allocations"][0]["farmer_name"] == "Amina Yusuf"
    assert order_response.json["allocations"][0]["location"] == "Kaduna"

    with app.app_context():
        assert Order.query.count() == 1
        assert Allocation.query.count() == 2
        assert sum(a.allocated_quantity for a in Allocation.query.all()) == 500
        assert db.session.get(Supply, first["id"]).status == "exhausted"
        assert db.session.get(Supply, second["id"]).status == "partial"


def test_oversupply_is_not_over_allocated_and_leftover_remains(client, app):
    f = farmer(client)
    b = buyer(client)
    created = supply(client, f["id"], quantity=530)
    result = demand(client, b["id"])
    assert result["status"] == "fulfilled"
    with app.app_context():
        record = db.session.get(Supply, created["id"])
        assert record.available_quantity == 30
        assert record.status == "partial"
        assert Order.query.first().quantity == 500


def test_repeated_status_checks_do_not_duplicate_order_or_allocations(client, app):
    f = farmer(client)
    b = buyer(client)
    supply(client, f["id"], quantity=500)
    created = demand(client, b["id"])
    first = client.get(f"/api/demands/{created['demand_id']}/status").json
    second = client.get(f"/api/demands/{created['demand_id']}/status").json
    assert first["order_id"] == second["order_id"]
    with app.app_context():
        assert Order.query.count() == 1
        assert Allocation.query.count() == 1


def test_incomplete_preview_does_not_reduce_supply(client, app):
    f = farmer(client)
    b = buyer(client)
    created = supply(client, f["id"], quantity=270)
    demand(client, b["id"])
    with app.app_context():
        assert db.session.get(Supply, created["id"]).available_quantity == 270


def test_find_previous_suppliers_excludes_contributors(app):
    with app.app_context():
        contributor = Farmer(ndfr_id="NDFR-001", name="Contributor", phone="1", location="Kaduna", verified=True)
        historical = Farmer(ndfr_id="NDFR-002", name="Historical", phone="2", location="Kaduna", verified=True)
        unverified = Farmer(ndfr_id="NDFR-003", name="Unverified", phone="3", location="Kaduna", verified=False)
        db.session.add_all([contributor, historical, unverified])
        db.session.flush()
        db.session.add_all([
            Supply(farmer_id=contributor.id, crop="MaIzE", unit="bags", quantity=100,
                   available_quantity=100, price_per_unit=1, location="Kaduna",
                   available_date=date(2026, 8, 20), status="active"),
            Supply(farmer_id=historical.id, crop="maize", unit="bags", quantity=100,
                   available_quantity=0, price_per_unit=1, location="Kaduna",
                   available_date=date(2026, 8, 20), status="exhausted"),
            Supply(farmer_id=unverified.id, crop="maize", unit="bags", quantity=100,
                   available_quantity=0, price_per_unit=1, location="Kaduna",
                   available_date=date(2026, 8, 20), status="exhausted"),
        ])
        demand_record = Demand(
            buyer_id=None,
            raw_text="test",
            crop="maize",
            unit="bags",
            quantity=100,
            location="Kaduna",
            required_date=date(2026, 8, 24),
        )
        # Use a real buyer because Demand has a required foreign key.
        real_buyer = Buyer(cac_id="CAC-001", business_name="Buyer", phone="4", email="x", location="Abuja")
        db.session.add(real_buyer)
        db.session.flush()
        demand_record.buyer_id = real_buyer.id
        db.session.add(demand_record)
        db.session.commit()
        assert [candidate.id for candidate in find_previous_suppliers(demand_record)] == [historical.id]


def test_canonical_demo_progresses_from_720_to_1030(client, app):
    current_farmers = [
        farmer(client, "NDFR-001", "08030000001"),
        farmer(client, "NDFR-002", "08030000002"),
        farmer(client, "NDFR-003", "08030000003"),
        farmer(client, "NDFR-004", "08030000004"),
    ]
    historical_farmers = [
        farmer(client, "NDFR-005", "08030000005"),
        farmer(client, "NDFR-006", "08030000006"),
        farmer(client, "NDFR-007", "08030000007"),
    ]
    b = buyer(client)
    for record, quantity in zip(current_farmers, (120, 180, 220, 200)):
        supply(client, record["id"], quantity=quantity)
    with app.app_context():
        db.session.add_all([
            Supply(
                farmer_id=record["id"], crop="maize", unit="bags", quantity=300,
                available_quantity=0, price_per_unit=39500, location="Kaduna",
                available_date=date(2026, 7, 1), status="exhausted",
            )
            for record in historical_farmers
        ])
        db.session.commit()

    created = demand(client, b["id"], quantity=1030)
    assert (created["gathered"], created["remaining"], created["farmers_to_notify"]) == (720, 310, 3)

    arrival = supply(client, historical_farmers[0]["id"], quantity=310, price_per_unit=42000)
    result = client.get(f"/api/demands/{created['demand_id']}/status").json
    assert result["status"] == "fulfilled"
    assert (result["gathered"], result["remaining"], result["percentage"], result["farmers_to_notify"]) == (1030, 0, 100, 0)
    assert result["order_id"]
    with app.app_context():
        assert sum(allocation.allocated_quantity for allocation in Allocation.query.all()) == 1030
        assert db.session.get(Supply, arrival["id"]).status == "exhausted"
