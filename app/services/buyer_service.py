from ..extensions import db
from ..models import Buyer
from .farmer_service import RegistrationError
from .registry import lookup_cac


def register_buyer(cac_id):
    record = lookup_cac(cac_id)
    if not record:
        raise RegistrationError("CAC record not found")

    buyer = Buyer.query.filter_by(cac_id=cac_id).first()
    if not buyer:
        buyer = Buyer(cac_id=cac_id, verified=True, **record)
        db.session.add(buyer)
    else:
        for key, value in record.items():
            setattr(buyer, key, value)
        buyer.verified = True
    db.session.commit()
    return buyer

