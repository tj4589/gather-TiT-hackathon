from datetime import datetime, timezone

from .extensions import db


def utc_now():
    return datetime.now(timezone.utc)


class Farmer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ndfr_id = db.Column(db.String(64), unique=True, nullable=False, index=True)
    name = db.Column(db.String(160), nullable=False)
    phone = db.Column(db.String(32), nullable=False)
    location = db.Column(db.String(160), nullable=False)
    verified = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
    supplies = db.relationship("Supply", back_populates="farmer", cascade="all, delete-orphan")


class Buyer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cac_id = db.Column(db.String(64), unique=True, nullable=False, index=True)
    business_name = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(32), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(160), nullable=False)
    verified = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
    demands = db.relationship("Demand", back_populates="buyer", cascade="all, delete-orphan")


class Supply(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey("farmer.id"), nullable=False, index=True)
    crop = db.Column(db.String(100), nullable=False)
    unit = db.Column(db.String(32), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    available_quantity = db.Column(db.Float, nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)
    location = db.Column(db.String(160), nullable=False)
    available_date = db.Column(db.Date, nullable=False)
    source = db.Column(db.String(80), nullable=False, default="farmer")
    status = db.Column(db.String(32), nullable=False, default="available")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
    farmer = db.relationship("Farmer", back_populates="supplies")
    allocations = db.relationship("Allocation", back_populates="supply")


class Demand(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey("buyer.id"), nullable=False, index=True)
    raw_text = db.Column(db.Text, nullable=False)
    crop = db.Column(db.String(100), nullable=False)
    unit = db.Column(db.String(32), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    location = db.Column(db.String(160), nullable=False)
    required_date = db.Column(db.Date, nullable=False)
    max_price_per_unit = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(32), nullable=False, default="open")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
    buyer = db.relationship("Buyer", back_populates="demands")
    orders = db.relationship("Order", back_populates="demand", cascade="all, delete-orphan")


class Order(db.Model):
    __table_args__ = (
        db.UniqueConstraint("demand_id", name="uq_order_demand_id"),
    )

    id = db.Column(db.Integer, primary_key=True)
    demand_id = db.Column(db.Integer, db.ForeignKey("demand.id"), nullable=False, index=True)
    quantity = db.Column(db.Float, nullable=False)
    total_value = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(32), nullable=False, default="pending")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
    demand = db.relationship("Demand", back_populates="orders")
    allocations = db.relationship("Allocation", back_populates="order", cascade="all, delete-orphan")


class Allocation(db.Model):
    __table_args__ = (
        db.UniqueConstraint("order_id", "supply_id", name="uq_allocation_order_supply"),
    )

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("order.id"), nullable=False, index=True)
    supply_id = db.Column(db.Integer, db.ForeignKey("supply.id"), nullable=False, index=True)
    allocated_quantity = db.Column(db.Float, nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)
    order = db.relationship("Order", back_populates="allocations")
    supply = db.relationship("Supply", back_populates="allocations")
