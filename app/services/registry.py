NDFR_RECORDS = {
    "NDFR-001": {
        "name": "Amina Yusuf",
        "phone_numbers": ["08030000001", "08140000001"],
        "location": "Kaduna",
    },
    "NDFR-002": {
        "name": "Chinedu Okafor",
        "phone_numbers": ["08030000002"],
        "location": "Benue",
    },
}

CAC_RECORDS = {
    "CAC-001": {
        "business_name": "Northstar Foods Ltd",
        "phone": "08050000001",
        "email": "procurement@northstar.example",
        "location": "Abuja",
    },
    "CAC-002": {
        "business_name": "Green Basket Markets",
        "phone": "08050000002",
        "email": "buying@greenbasket.example",
        "location": "Lagos",
    },
}


def lookup_ndfr(ndfr_id):
    return NDFR_RECORDS.get(ndfr_id)


def lookup_cac(cac_id):
    return CAC_RECORDS.get(cac_id)

