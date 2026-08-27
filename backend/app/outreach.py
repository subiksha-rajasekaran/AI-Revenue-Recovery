import time
from datetime import datetime
from app.schemas import DispatchOutreachRequest, DispatchOutreachResponse

def generate_retell_voice_payload(req: DispatchOutreachRequest) -> dict:
    """Generates Retell AI dynamic call parameters and prompt configuration."""
    if req.language == "HINGLISH":
        agent_prompt = (
            f"Aap RecovAI Engine se bol rahe hain. {req.customer_name} ji, aapka subscription payment "
            f"of ${req.amount_due:,.2f} fail ho gaya hai due to expired card. "
            "Kya main aapko ek quick WhatsApp link bhej doon to update card details in 30 seconds?"
        )
        voice_id = "retell-hindi-english-localized-01"
    else:
        agent_prompt = (
            f"Hello {req.customer_name}, this is RecovAI assistant calling regarding your account. "
            f"We noticed your payment of ${req.amount_due:,.2f} failed due to an expired card. "
            "Would you like me to send a 1-click update link to your phone now?"
        )
        voice_id = "retell-us-female-pro-02"

    return {
        "provider": "RETELL_AI",
        "voice_id": voice_id,
        "phone_number": req.phone_number,
        "dynamic_variables": {
            "customer_name": req.customer_name,
            "amount_due": f"${req.amount_due:,.2f}",
            "mandate_update_url": f"https://pay.razorpay.com/update-card?ref={req.case_id}"
        },
        "system_prompt": agent_prompt
    }

def generate_twilio_sms_payload(req: DispatchOutreachRequest) -> dict:
    """Generates Twilio SMS collection message."""
    link = f"https://pay.razorpay.com/retry?ref={req.case_id}"
    if req.language == "HINGLISH":
        body = f"Hi {req.customer_name}, aapka payment of ${req.amount_due:,.2f} pending hai. Pay/update card now: {link}"
    else:
        body = f"Hi {req.customer_name}, payment of ${req.amount_due:,.2f} failed. Securely retry or update payment method: {link}"

    return {
        "provider": "TWILIO_SMS",
        "to": req.phone_number,
        "message_body": body,
        "callback_url": f"http://localhost:8000/api/v1/webhooks/twilio/{req.case_id}"
    }

def generate_whatsapp_payload(req: DispatchOutreachRequest) -> dict:
    """Generates WhatsApp Business API interactive message payload."""
    return {
        "provider": "WHATSAPP_BUSINESS",
        "to": req.phone_number,
        "template_name": "payment_failure_nudge_v1",
        "components": [
            {
                "type": "body",
                "parameters": [
                    {"type": "text", "text": req.customer_name},
                    {"type": "text", "text": f"${req.amount_due:,.2f}"}
                ]
            },
            {
                "type": "button",
                "sub_type": "url",
                "index": "0",
                "parameters": [{"type": "text", "text": req.case_id}]
            }
        ]
    }

def dispatch_outreach(req: DispatchOutreachRequest) -> DispatchOutreachResponse:
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    dispatch_id = f"disp_{int(time.time() * 1000)}"

    if req.channel == "RETELL_VOICE":
        payload = generate_retell_voice_payload(req)
    elif req.channel == "TWILIO_SMS":
        payload = generate_twilio_sms_payload(req)
    else:
        payload = generate_whatsapp_payload(req)

    return DispatchOutreachResponse(
        success=True,
        dispatch_id=dispatch_id,
        channel=req.channel,
        status="DISPATCHED",
        rendered_payload=payload,
        timestamp=now_str
    )