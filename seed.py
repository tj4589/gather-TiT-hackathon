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


with app.app_context():
    farmer_one = get_or_create_farmer("NDFR-001", "Amina Yusuf", "08030000001", "Kaduna")
    farmer_two = get_or_create_farmer("NDFR-002", "Chinedu Okafor", "08030000002", "Kaduna")

    # The initial compatible network supply is deliberately 120 + 150 = 270 bags.
    for farmer, quantity, price in ((farmer_one, 120, 40000), (farmer_two, 150, 40500)):
        exists = Supply.query.filter_by(
            farmer_id=farmer.id, crop="maize", unit="bags", price_per_unit=price
        ).first()
        if not exists:
            create_supply(farmer.id, "maize", "bags", quantity, price,
                          "Kaduna", date(2026, 8, 24))

    # Exhausted records give the notification service realistic historical farmer data.
    for ndfr_id, name, phone in (
        ("NDFR-003", "Bello Musa", "08030000003"),
        ("NDFR-004", "Grace Eze", "08030000004"),
        ("NDFR-005", "Fatima Lawal", "08030000005"),
    ):
        farmer = get_or_create_farmer(ndfr_id, name, phone, "Kaduna")
        exists = Supply.query.filter_by(farmer_id=farmer.id, crop="maize", unit="bags").first()
        if not exists:
            db.session.add(Supply(
                farmer_id=farmer.id, crop="maize", unit="bags", quantity=300,
                available_quantity=0, price_per_unit=39500, location="Kaduna",
                available_date=date(2026, 7, 1), status="exhausted",
            ))
            db.session.commit()

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
            raw_text="I need 500 bags of maize in Kaduna by Monday",
            crop="maize", unit="bags", quantity=500, location="Kaduna",
            required_date=date(2026, 8, 24), status="open",
        )
        db.session.add(demand)
        db.session.commit()
    result = gather_demand(demand)
    print(f"Seed data loaded: demand {demand.id} is {result['gathered']}/{result['requested']} ({result['status']})")
