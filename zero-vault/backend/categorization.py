import re


# ============================================================
# MERCHANT-BASED AUTO-CATEGORIZATION
# ============================================================

MERCHANT_RULES = [
    # Transport
    (
        "Transport",
        [
            "MOBILE ICOCA",
            "ICOCA",
            "JR WEST",
            "JR KYOTO",
            "KYOTO CITY BUS",
            "KYOTO MUNICIPAL SUBWAY",
        ],
    ),

    # Food: restaurants and fast food
    (
        "Food",
        [
            "MCDONALD",
            "MACDONALD",
            "MOS BURGER",
            "KFC",
            "KENTUCKY FRIED CHICKEN",
            "STARBUCKS",
            "DOUTOR",
            "TULLY'S",
            "RESTAURANT",
            "IZAKAYA",
            "RAMEN",
            "SUSHI",
            "CAFE",
        ],
    ),

    # Groceries: supermarkets and convenience stores
    (
        "Groceries",
        [
            "LIFE CORPORATION",
            "LIFE CORPORATION LTD",
            "FRESCO",
            "GYOMU SUPER",
            "GYOMU SUPERMARKET",
            "AEON",
            "MAXVALU",
            "IZUMIYA",
            "MANDai",
            "SEVEN-ELEVEN",
            "7-ELEVEN",
            "7 ELEVEN",
            "SEVEN ELEVEN",
            "FAMILY MART",
            "FAMILYMART",
            "LAWSON",
            "MINISTOP",
        ],
    ),

    # Shopping and household goods
    (
        "Shopping",
        [
            "DAISO",
            "SERIA",
            "CAN DO",
            "CANDO",
            "DON QUIJOTE",
            "DONKI",
            "AMAZON",
            "RAKUTEN",
            "UNIQLO",
            "GU ",
            "NITORI",
        ],
    ),

    # Health and personal care
    (
        "Health & Personal Care",
        [
            "MATSUMOTO KIYOSHI",
            "MATSUMOTO SHINMARUTAMAC",
            "WELCIA",
            "SUNDRUG",
            "KOKUMIN",
            "DRUGSTORE",
        ],
    ),

    # Bills and housing
    (
        "Rent",
        [
            "HOUSE RENT",
            "APARTMENT RENT",
            "RENT PAYMENT",
        ],
    ),

    (
        "Utilities",
        [
            "ELECTRICITY",
            "ELECTRIC POWER",
            "GAS COMPANY",
            "WATERWORKS",
        ],
    ),
]


def categorize_transaction(merchant: str, amount: float = 0) -> str:
    """
    Return a category based on the merchant name.

    Unrecognized merchants remain Uncategorized.
    """
    if not merchant:
        return "Uncategorized"

    name = re.sub(r"\s+", " ", merchant.upper()).strip()

    for category, keywords in MERCHANT_RULES:
        for keyword in keywords:
            if keyword.upper() in name:
                return category

    return "Uncategorized"
