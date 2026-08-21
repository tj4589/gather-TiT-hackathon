from datetime import date

from app import create_app
from app.extensions import db
from app.models import Buyer, Demand, Farmer, Supply
from app.services.demand_service import gather_demand
from app.services.supply_service import create_supply


app = create_app()


def get_or_create_farmer(ndfr_id, name, phone, location):
    farmer = Farmer.query.filter_by(ndfr_id=ndfr_id).first()
    if not farmer:
        farmer = Farmer(ndfr_id=ndfr_id, name=name, phone=phone,
                        location=location, verified=True)
        db.session.add(farmer)
        db.session.commit()
    return farmer


def ensure_demo_supply(farmer, quantity, price):
    supplies = Supply.query.filter_by(
        farmer_id=farmer.id, crop="maize", unit="bags"
    ).all()
    for existing in supplies:
        if (not existing.allocations
                and existing.price_per_unit != price
                and existing.status in {"active", "available", "partial"}):
            existing.available_quantity = 0
            existing.status = "exhausted"
    supply = next((item for item in supplies if item.price_per_unit == price), None)
    if not supply:
        create_supply(farmer.id, "maize", "bags", quantity, price,
                      "Kaduna", date(2026, 8, 24))
        return
    if not supply.allocations:
        supply.quantity = quantity
        supply.available_quantity = quantity
        supply.price_per_unit = price
        supply.location = "Kaduna"
        supply.available_date = date(2026, 8, 24)
        supply.status = "available"
        db.session.commit()


def ensure_historical_supply(farmer):
    supply = Supply.query.filter_by(
        farmer_id=farmer.id, crop="maize", unit="bags"
    ).first()
    if not supply:
        supply = Supply(
            farmer_id=farmer.id, crop="maize", unit="bags", quantity=300,
            available_quantity=0, price_per_unit=39500, location="Kaduna",
            available_date=date(2026, 7, 1), status="exhausted",
        )
        db.session.add(supply)
    elif not supply.allocations:
        supply.quantity = 300
        supply.available_quantity = 0
        supply.price_per_unit = 39500
        supply.location = "Kaduna"
        supply.available_date = date(2026, 7, 1)
        supply.status = "exhausted"
    db.session.commit()


with app.app_context():
    farmer_one = get_or_create_farmer("NDFR-001", "Amina Yusuf", "08030000001", "Kaduna")
    farmer_two = get_or_create_farmer("NDFR-002", "Chinedu Okafor", "08030000002", "Kaduna")
    farmer_three = get_or_create_farmer("NDFR-003", "Musa Ibrahim", "08030000003", "Kaduna")
    farmer_four = get_or_create_farmer("NDFR-004", "Abdulrahman Bello", "08030000004", "Kaduna")

    # The signature-flow network starts at exactly 720 bags: 120 + 180 + 220 + 200.
    for farmer, quantity, price in (
        (farmer_one, 120, 40000),
        (farmer_three, 180, 40500),
        (farmer_two, 220, 41000),
        (farmer_four, 200, 41500),
    ):
        ensure_demo_supply(farmer, quantity, price)

    # Three exhausted records give the notification service realistic candidates.
    for ndfr_id, name, phone in (
        ("NDFR-005", "Bello Musa", "08030000005"),
        ("NDFR-006", "Grace Eze", "08030000006"),
        ("NDFR-007", "Fatima Lawal", "08030000007"),
    ):
        farmer = get_or_create_farmer(ndfr_id, name, phone, "Kaduna")
        ensure_historical_supply(farmer)

    buyer = Buyer.query.filter_by(cac_id="CAC-001").first()
    if not buyer:
        buyer = Buyer(cac_id="CAC-001", business_name="Northstar Foods Ltd",
                      phone="08050000001", email="procurement@northstar.example",
                      location="Abuja", verified=True)
        db.session.add(buyer)
        db.session.commit()

    demand = Demand.query.filter_by(buyer_id=buyer.id, crop="maize", unit="bags").first()
    if not demand:
        demand = Demand(
            buyer_id=buyer.id,
            raw_text="I need 1030 bags of maize in Kaduna by Monday",
            crop="maize", unit="bags", quantity=1030, location="Kaduna",
            required_date=date(2026, 8, 24), status="open",
        )
        db.session.add(demand)
        db.session.commit()
    elif not demand.orders:
        demand.raw_text = "I need 1030 bags of maize in Kaduna by Monday"
        demand.quantity = 1030
        demand.location = "Kaduna"
        demand.required_date = date(2026, 8, 24)
        demand.max_price_per_unit = None
        demand.status = "open"
        db.session.commit()
    result = gather_demand(demand)
    print(f"Seed data loaded: demand {demand.id} is {result['gathered']}/{result['requested']} ({result['status']})")
