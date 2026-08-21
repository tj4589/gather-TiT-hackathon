from datetime import date

from app import create_app
from app.extensions import db
from app.models import Farmer, Buyer
from app.services.supply_service import create_supply


app = create_app()


with app.app_context():
    farmer = Farmer.query.filter_by(ndfr_id="NDFR-001").first()
    if not farmer:
        farmer = Farmer(ndfr_id="NDFR-001", name="Amina Yusuf", phone="08030000001",
                        location="Kaduna", verified=True)
        db.session.add(farmer)
        db.session.commit()
    buyer = Buyer.query.filter_by(cac_id="CAC-001").first()
    if not buyer:
        buyer = Buyer(cac_id="CAC-001", business_name="Northstar Foods Ltd",
                      phone="08050000001", email="procurement@northstar.example",
                      location="Abuja", verified=True)
        db.session.add(buyer)
        db.session.commit()
    if not farmer.supplies:
        create_supply(farmer.id, "maize", "kg", 1000, 850, "Kaduna", date.today())
    print("Seed data loaded")

