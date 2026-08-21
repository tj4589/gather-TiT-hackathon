from datetime import date

from ..extensions import db
from ..models import Farmer, Supply


class SupplyError(ValueError):
    pass


def create_supply(farmer_id, crop, unit, quantity, price_per_unit, location, available_date, source="farmer"):
    farmer = db.session.get(Farmer, farmer_id)
    if not farmer:
        raise SupplyError("farmer not found")
    if not farmer.verified:
        raise SupplyError("farmer must be verified")
    if quantity <= 0 or price_per_unit < 0:
        raise SupplyError("quantity must be positive and price cannot be negative")
    if isinstance(available_date, str):
        try:
            available_date = date.fromisoformat(available_date)
        except ValueError as exc:
            raise SupplyError("available_date must be YYYY-MM-DD") from exc

    supply = Supply(
        farmer_id=farmer_id,
        crop=crop,
        unit=unit,
        quantity=quantity,
        available_quantity=quantity,
        price_per_unit=price_per_unit,
        location=location,
        available_date=available_date,
        source=source,
    )
    db.session.add(supply)
    db.session.commit()
    return supply

