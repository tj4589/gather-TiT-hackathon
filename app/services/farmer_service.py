from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import Farmer
from .registry import lookup_ndfr


class RegistrationError(ValueError):
    pass


def register_farmer(ndfr_id, calling_phone):
    record = lookup_ndfr(ndfr_id)
    if not record:
        raise RegistrationError("NDFR record not found")
    if calling_phone not in record["phone_numbers"]:
        raise RegistrationError("calling phone does not match NDFR record")

    farmer = Farmer.query.filter_by(ndfr_id=ndfr_id).first()
    if farmer:
        farmer.phone = calling_phone
        farmer.verified = True
    else:
        farmer = Farmer(
            ndfr_id=ndfr_id,
            name=record["name"],
            phone=calling_phone,
            location=record["location"],
            verified=True,
        )
        db.session.add(farmer)
    try:
        db.session.commit()
    except IntegrityError as exc:
        db.session.rollback()
        raise RegistrationError("farmer could not be registered") from exc
    return farmer

