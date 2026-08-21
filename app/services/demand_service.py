"""Demand aggregation and supplier-network services."""

from datetime import date

from sqlalchemy import func

from ..extensions import db
from ..models import Allocation, Demand, Farmer, Order, Supply


ACTIVE_SUPPLY_STATUSES = {"active", "available", "partial"}
EPSILON = 1e-9


class DemandError(ValueError):
    """Raised when a demand cannot be created or evaluated."""


def _normalized(value):
    return " ".join(str(value or "").strip().casefold().split())


def _number(value):
    """Return integral floats as ints to keep API responses easy to consume."""
    if isinstance(value, float) and value.is_integer():
        return int(value)
    return value


def _parse_date(value, field_name):
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError) as exc:
        raise DemandError(f"{field_name} must be YYYY-MM-DD") from exc


def create_demand(*, buyer_id, raw_text, crop, unit, quantity, location,
                  required_date, max_price_per_unit=None):
    """Persist a structured buyer demand and immediately evaluate its supply."""
    from ..models import Buyer

    buyer = db.session.get(Buyer, buyer_id)
    if not buyer:
        raise DemandError("buyer not found")
    if not raw_text or not crop or not unit or not location:
        raise DemandError("raw_text, crop, unit, and location are required")
    try:
        quantity = float(quantity)
    except (TypeError, ValueError) as exc:
        raise DemandError("quantity must be a positive number") from exc
    if quantity <= 0:
        raise DemandError("quantity must be a positive number")
    if max_price_per_unit is not None:
        try:
            max_price_per_unit = float(max_price_per_unit)
        except (TypeError, ValueError) as exc:
            raise DemandError("max_price_per_unit must be a non-negative number") from exc
        if max_price_per_unit < 0:
            raise DemandError("max_price_per_unit must be a non-negative number")

    demand = Demand(
        buyer_id=buyer_id,
        raw_text=raw_text,
        crop=crop,
        unit=unit,
        quantity=quantity,
        location=location,
        required_date=_parse_date(required_date, "required_date"),
        max_price_per_unit=max_price_per_unit,
    )
    db.session.add(demand)
    db.session.commit()
    return demand, gather_demand(demand)


def _compatible_supplies(demand):
    supplies = Supply.query.filter(
        func.lower(Supply.crop) == _normalized(demand.crop),
        func.lower(Supply.unit) == _normalized(demand.unit),
        Supply.available_date <= demand.required_date,
        Supply.available_quantity > 0,
    ).all()

    return sorted(
        (
            supply for supply in supplies
            if _normalized(supply.location) == _normalized(demand.location)
            and str(supply.status).casefold() in ACTIVE_SUPPLY_STATUSES
            and (
                demand.max_price_per_unit is None
                or supply.price_per_unit <= demand.max_price_per_unit
            )
        ),
        key=lambda supply: (
            supply.price_per_unit,
            supply.created_at,
            supply.id,
        ),
    )


def _preview(demand, supplies):
    remaining = demand.quantity
    contributions = []
    for supply in supplies:
        if remaining <= EPSILON:
            break
        contribution = min(supply.available_quantity, remaining)
        contributions.append({
            "supply_id": supply.id,
            "farmer_id": supply.farmer_id,
            "available_quantity": _number(supply.available_quantity),
            "contribution": _number(contribution),
            "price_per_unit": _number(supply.price_per_unit),
        })
        remaining -= contribution

    gathered = demand.quantity - max(remaining, 0)
    fulfilled = remaining <= EPSILON
    return {
        "requested": _number(demand.quantity),
        "gathered": _number(gathered),
        "remaining": _number(max(remaining, 0)),
        "percentage": _number(round(min(gathered / demand.quantity * 100, 100), 2)),
        "status": "fulfilled" if fulfilled else "gathering",
        "supplies": contributions,
    }


def _order_result(demand, order):
    allocations = sorted(order.allocations, key=lambda allocation: allocation.id)
    gathered = sum(allocation.allocated_quantity for allocation in allocations)
    return {
        "requested": _number(demand.quantity),
        "gathered": _number(gathered),
        "remaining": 0,
        "percentage": 100,
        "status": "fulfilled",
        "supplies": [
            {
                "supply_id": allocation.supply_id,
                "farmer_id": allocation.supply.farmer_id,
                "available_quantity": _number(
                    allocation.allocated_quantity + allocation.supply.available_quantity
                ),
                "contribution": _number(allocation.allocated_quantity),
                "price_per_unit": _number(allocation.price_per_unit),
            }
            for allocation in allocations
        ],
        "order_id": order.id,
    }


def _fulfill(demand, supplies):
    existing_order = Order.query.filter_by(demand_id=demand.id).first()
    if existing_order:
        demand.status = "fulfilled"
        return _order_result(demand, existing_order)

    preview = _preview(demand, supplies)
    if preview["status"] != "fulfilled":
        demand.status = "gathering"
        db.session.commit()
        preview["farmers_to_notify"] = len(find_previous_suppliers(demand, supplies=supplies))
        return preview

    order = Order(
        demand_id=demand.id,
        quantity=demand.quantity,
        total_value=0,
        status="awaiting_payment",
    )
    db.session.add(order)
    db.session.flush()

    remaining = demand.quantity
    total_value = 0
    for supply in supplies:
        if remaining <= EPSILON:
            break
        allocated_quantity = min(supply.available_quantity, remaining)
        allocation = Allocation(
            order_id=order.id,
            supply_id=supply.id,
            allocated_quantity=allocated_quantity,
            price_per_unit=supply.price_per_unit,
        )
        db.session.add(allocation)
        supply.available_quantity = max(supply.available_quantity - allocated_quantity, 0)
        supply.status = "exhausted" if supply.available_quantity <= EPSILON else "partial"
        total_value += allocated_quantity * supply.price_per_unit
        remaining -= allocated_quantity

    order.total_value = total_value
    demand.status = "fulfilled"
    db.session.commit()
    return _order_result(demand, order)


def gather_demand(demand):
    """Evaluate current compatible supply and fulfill atomically when possible."""
    if demand.status == "fulfilled":
        existing_order = Order.query.filter_by(demand_id=demand.id).first()
        if existing_order:
            result = _order_result(demand, existing_order)
            result["farmers_to_notify"] = 0
            return result

    supplies = _compatible_supplies(demand)
    return _fulfill(demand, supplies)


def find_previous_suppliers(demand, supplies=None):
    """Return verified farmers with historical same-crop records not contributing now."""
    if supplies is None:
        existing_order = Order.query.filter_by(demand_id=demand.id).first()
        if existing_order:
            supplies = [allocation.supply for allocation in existing_order.allocations]
        else:
            supplies = _compatible_supplies(demand)
    contributing_farmer_ids = {supply.farmer_id for supply in supplies}
    historical = Farmer.query.join(Supply).filter(
        Farmer.verified.is_(True),
        func.lower(Supply.crop) == _normalized(demand.crop),
    ).order_by(Farmer.id).all()
    seen = set()
    candidates = []
    for farmer in historical:
        if farmer.id in contributing_farmer_ids or farmer.id in seen:
            continue
        seen.add(farmer.id)
        candidates.append(farmer)
    return candidates


def order_detail(order):
    allocations = sorted(order.allocations, key=lambda allocation: allocation.id)
    return {
        "order_id": order.id,
        "demand_id": order.demand_id,
        "status": order.status,
        "quantity": _number(order.quantity),
        "total_value": _number(order.total_value),
        "allocations": [
            {
                "allocation_id": allocation.id,
                "supply_id": allocation.supply_id,
                "farmer_id": allocation.supply.farmer_id,
                "allocated_quantity": _number(allocation.allocated_quantity),
                "price_per_unit": _number(allocation.price_per_unit),
            }
            for allocation in allocations
        ],
    }
