import os
import random
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

# In-memory OTP store: { email: { otp, expires_at, phone } }
otp_store: dict = {}

OTP_EXPIRY_SECONDS = 300  # 5 minutes


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def send_email_otp(email: str, otp: str):
    gmail_user = os.getenv("GMAIL_USER")
    gmail_pass = os.getenv("GMAIL_APP_PASSWORD")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your Smart Doc Analyzer OTP"
    msg["From"]    = gmail_user
    msg["To"]      = email

    html = f"""
    <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:32px;background:#0f1117;border-radius:12px;">
      <h2 style="color:#6ee7b7;">Smart Doc Analyzer</h2>
      <p style="color:#94a3b8;">Your OTP for registration:</p>
      <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#f1f5f9;margin:24px 0;">{otp}</div>
      <p style="color:#475569;font-size:13px;">Expires in 5 minutes. Do not share this with anyone.</p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(gmail_user, gmail_pass)
        server.sendmail(gmail_user, email, msg.as_string())


def send_sms_otp(phone: str, otp: str):
    from twilio.rest import Client
    client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
    client.messages.create(
        body=f"Your Smart Doc Analyzer OTP is: {otp}. Valid for 5 minutes.",
        from_=os.getenv("TWILIO_PHONE"),
        to=phone,
    )


def create_and_send_otp(email: str, phone: str):
    otp = generate_otp()
    otp_store[email] = {
        "otp":        otp,
        "expires_at": time.time() + OTP_EXPIRY_SECONDS,
        "phone":      phone,
    }
    # Send both
    send_email_otp(email, otp)
    send_sms_otp(phone, otp)


def verify_otp(email: str, otp: str) -> bool:
    record = otp_store.get(email)
    if not record:
        return False
    if time.time() > record["expires_at"]:
        otp_store.pop(email, None)
        return False
    if record["otp"] != otp:
        return False
    otp_store.pop(email, None)  # OTP used, remove it
    return True