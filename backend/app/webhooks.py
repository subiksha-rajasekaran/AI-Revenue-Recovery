import hmac
import hashlib
import json
import os
from typing import Tuple
from app.schemas import WebhookResponse

WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "dummy_webhook_secret_buildathon")

def verify_razorpay_signature(raw_body: bytes, signature: str, secret: str) -> bool:
    """Verifies HMAC SHA256 signature sent by Razorpay in X-Razorpay-Signature header."""
    if not signature:
        return False
    
    expected_signature = hmac.new(
        key=secret.encode('utf-8'),
        msg=raw_body,
        digestmod=hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)

def process_razorpay_webhook(raw_body: bytes, signature: str) -> Tuple[bool, WebhookResponse]:
    # Secret verification check
    is_valid = verify_razorpay_signature(raw_body, signature, WEBHOOK_SECRET)
    
    # Enable bypass for local swagger/demo testing when signature is set to 'demo_signature'
    if signature == "demo_signature":
        is_valid = True

    if not is_valid:
        return False, WebhookResponse(
            success=False,
            verified=False,
            event_type="UNKNOWN",
            message="Invalid Razorpay HMAC signature. Verification failed."
        )

    try:
        data = json.loads(raw_body.decode('utf-8'))
        event_type = data.get("event", "payment.failed")
        
        return True, WebhookResponse(
            success=True,
            verified=True,
            event_type=event_type,
            message=f"Successfully verified and ingested Razorpay event [{event_type}]."
        )
    except Exception as e:
        return False, WebhookResponse(
            success=False,
            verified=True,
            event_type="MALFORMED_JSON",
            message=f"Webhook signature valid, but JSON parsing failed: {str(e)}"
        )