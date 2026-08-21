from flask import Blueprint, jsonify, request

from .extensions import db
from .services.buyer_service import register_buyer
from .services.demand_service import DemandError, create_demand, find_previous_suppliers, gather_demand, order_detail
from .services.farmer_service import RegistrationError, register_farmer
from .services.supply_service import SupplyError, create_supply


api = Blueprint("api", __name__)


def farmer_json(farmer):
    return {"id": farmer.id, "ndfr_id": farmer.ndfr_id, "name": farmer.name,
            "phone": farmer.phone, "location": farmer.location, "verified": farmer.verified}


def buyer_json(buyer):
    return {"id": buyer.id, "cac_id": buyer.cac_id, "business_name": buyer.business_name,
            "phone": buyer.phone, "email": buyer.email, "location": buyer.location,
            "verified": buyer.verified}


@api.get("/health")
def health():
    return jsonify({"status": "ok"})


@api.post("/farmers/register")
def farmer_registration():
    data = request.get_json(silent=True) or {}
    if not data.get("ndfr_id") or not data.get("calling_phone"):
        return jsonify({"error": "ndfr_id and calling_phone are required"}), 400
    try:
        farmer = register_farmer(data["ndfr_id"], data["calling_phone"])
    except RegistrationError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify(farmer_json(farmer)), 201


@api.post("/buyers/register")
def buyer_registration():
    data = request.get_json(silent=True) or {}
    if not data.get("cac_id"):
        return jsonify({"error": "cac_id is required"}), 400
    try:
        buyer = register_buyer(data["cac_id"])
    except RegistrationError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify(buyer_json(buyer)), 201


@api.post("/supplies")
def supply_creation():
    data = request.get_json(silent=True) or {}
    required = ("farmer_id", "crop", "unit", "quantity", "price_per_unit", "location", "available_date")
    missing = [field for field in required if field not in data]
    if missing:
        return jsonify({"error": f"missing fields: {', '.join(missing)}"}), 400
    try:
        supply = create_supply(**data)
    except (SupplyError, TypeError) as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify({"id": supply.id, "farmer_id": supply.farmer_id, "crop": supply.crop,
                    "unit": supply.unit, "quantity": supply.quantity,
                    "available_quantity": supply.available_quantity,
                    "price_per_unit": supply.price_per_unit, "status": supply.status}), 201


@api.post("/demands")
def demand_creation():
    data = request.get_json(silent=True) or {}
    required = ("buyer_id", "raw_text", "crop", "unit", "quantity", "location", "required_date")
    missing = [field for field in required if field not in data]
    if missing:
        return jsonify({"error": f"missing fields: {', '.join(missing)}"}), 400
    try:
        demand, result = create_demand(
            buyer_id=data["buyer_id"],
            raw_text=data["raw_text"],
            crop=data["crop"],
            unit=data["unit"],
            quantity=data["quantity"],
            location=data["location"],
            required_date=data["required_date"],
            max_price_per_unit=data.get("max_price_per_unit"),
        )
    except (DemandError, TypeError, ValueError) as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify({
        "demand_id": demand.id,
        "status": result["status"],
        "requested": result["requested"],
        "gathered": result["gathered"],
        "remaining": result["remaining"],
        "percentage": result["percentage"],
        "farmers_to_notify": result.get("farmers_to_notify", 0),
        **({"order_id": result["order_id"]} if "order_id" in result else {}),
    }), 201


@api.get("/demands/<int:demand_id>/status")
def demand_status(demand_id):
    from .models import Demand

    demand = db.session.get(Demand, demand_id)
    if not demand:
        return jsonify({"error": "demand not found"}), 404
    result = gather_demand(demand)
    return jsonify({
        "demand_id": demand.id,
        "status": result["status"],
        "requested": result["requested"],
        "gathered": result["gathered"],
        "remaining": result["remaining"],
        "percentage": result["percentage"],
        "farmers_to_notify": result.get("farmers_to_notify", len(find_previous_suppliers(demand))),
        **({"order_id": result["order_id"]} if "order_id" in result else {}),
    })


@api.get("/orders/<int:order_id>")
def order_get(order_id):
    from .models import Order

    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({"error": "order not found"}), 404
    return jsonify(order_detail(order))
