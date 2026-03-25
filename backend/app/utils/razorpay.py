import razorpay
from app.core.config import settings

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

def create_order(amount: int, currency: str = "INR"):
    """
    Creates a Razorpay Order.
    Amount should be in paise.
    """
    data = {
        "amount": amount,
        "currency": currency,
        "payment_capture": 1
    }
    return client.order.create(data=data)

def verify_signature(order_id: str, payment_id: str, signature: str):
    """
    Verifies Razorpay payment signature.
    """
    params_dict = {
        'razorpay_order_id': order_id,
        'razorpay_payment_id': payment_id,
        'razorpay_signature': signature
    }
    try:
        client.utility.verify_payment_signature(params_dict)
        return True
    except Exception:
        return False
