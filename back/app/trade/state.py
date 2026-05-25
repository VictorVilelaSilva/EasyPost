from app.common.exceptions import BadRequestError

TRADE_TRANSITIONS: dict[str, set[str]] = {
    "pending_payment": {"paid", "cancelled"},
    "paid": {"trade_pending"},
    "trade_pending": {"trade_sent", "cancelled"},
    "trade_sent": {"offer_confirmed", "cancelled"},
    "offer_confirmed": {"completed", "cancelled"},
    "completed": set(),
    "cancelled": {"refunded"},
    "refunded": set(),
}

GIFT_TRANSITIONS: dict[str, set[str]] = {
    "pending_payment": {"paid", "cancelled"},
    "paid": {"seller_confirming"},
    "seller_confirming": {"friend_pending", "cancelled"},
    "friend_pending": {"friendship_cooling", "gift_pending", "cancelled"},
    "friendship_cooling": {"gift_pending", "cancelled"},
    "gift_pending": {"gift_sent", "cancelled"},
    "gift_sent": {"completed", "cancelled"},
    "completed": set(),
    "cancelled": {"refunded"},
    "refunded": set(),
}

_TRANSITIONS_BY_DELIVERY: dict[str, dict[str, set[str]]] = {
    "trade": TRADE_TRANSITIONS,
    "gift": GIFT_TRANSITIONS,
}


def check_transition(delivery_type: str, current: str, target: str) -> None:
    table = _TRANSITIONS_BY_DELIVERY.get(delivery_type)
    if table is None:
        raise BadRequestError(f"Unknown delivery_type '{delivery_type}'")
    allowed = table.get(current, set())
    if target not in allowed:
        raise BadRequestError(
            f"Cannot transition from '{current}' to '{target}' in {delivery_type} flow"
        )
