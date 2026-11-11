import smtplib
import random
import string
import time
import os
import asyncio
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

# In-memory OTP storage
OTP_STORE = {}

# Hosted HTTPS CDN URL for permanent, universal rendering across all Gmail / iOS / Android apps
LOGO_PUBLIC_URL = "https://iili.io/nm0MpIV.png"

def generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))

def send_smtp_email(to_email: str, subject: str, html_content: str):
    """Synchronous pure HTML email sender with public hosted logo URL (No CID attachments)"""
    if not settings.SMTP_PASSWORD:
        print(f"[EMAIL DEV MODE] No SMTP_PASSWORD set. Subject: {subject} to {to_email}")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Bokivo <{settings.SMTP_FROM}>"
    msg["To"] = to_email

    part = MIMEText(html_content, "html")
    msg.attach(part)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        pwd = settings.SMTP_PASSWORD.replace(" ", "")
        server.login(settings.SMTP_USER, pwd)
        server.sendmail(settings.SMTP_FROM, [to_email], msg.as_string())
    return True

async def send_verification_otp(email: str) -> str:
    """Generate, store, and email OTP with hosted Bokivo logo"""
    otp = generate_otp(6)
    expires_at = time.time() + (5 * 60) # 5 mins
    OTP_STORE[email.lower()] = {
        "otp": otp,
        "expires_at": expires_at
    }

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 24px; }}
        .card {{ max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 18px; padding: 36px 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); text-align: center; }}
        .logo-wrap {{ text-align: center; margin-bottom: 16px; }}
        .logo-img {{ width: 90px; height: auto; display: inline-block; margin: 0 auto; border: none; }}
        .badge {{ margin-bottom: 16px; }}
        .badge span {{ background-color: #E0F2FE; color: #0284C7; font-size: 12px; font-weight: 800; padding: 5px 14px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; }}
        .title {{ font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 8px; }}
        .sub {{ font-size: 14px; color: #64748B; margin: 0 0 24px; line-height: 1.5; }}
        .otp-box {{ background: #F8FAFC; border: 2px dashed #38B6FF; border-radius: 14px; text-align: center; padding: 22px; margin: 0 0 24px; }}
        .otp-code {{ font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #0F172A; margin: 0; }}
        .expiry {{ font-size: 12px; color: #94A3B8; margin-top: 8px; font-weight: 600; }}
        .footer {{ font-size: 12px; color: #94A3B8; text-align: center; line-height: 1.5; border-top: 1px solid #E2E8F0; padding-top: 18px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo-wrap">
          <img class="logo-img" src="{LOGO_PUBLIC_URL}" alt="Bokivo Logo" width="90" style="display:block; margin: 0 auto;" />
          <div style="font-size: 22px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px; margin-top: 8px;">BOKIVO</div>
        </div>
        <div class="badge"><span>Account Verification</span></div>
        <h2 class="title">Verify Your Email Address</h2>
        <p class="sub">Thank you for joining Bokivo! Enter the one-time verification code below to complete creating your account.</p>
        <div class="otp-box">
          <div class="otp-code">{otp}</div>
          <div class="expiry">Expires in 5 minutes</div>
        </div>
        <p class="sub" style="font-size: 13px;">If you did not request this email, please disregard.</p>
        <div class="footer">
          &copy; 2026 Bokivo Team. All rights reserved. • Automated notification from bokivo.team@gmail.com
        </div>
      </div>
    </body>
    </html>
    """

    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(None, send_smtp_email, email, "Your Bokivo Verification Code", html)
    except Exception as e:
        print(f"[OTP ERROR]: {e}")
        print(f"👉 [FALLBACK OTP FOR {email}]: {otp}")

    return otp

def verify_otp(email: str, entered_otp: str) -> bool:
    entry = OTP_STORE.get(email.lower())
    if not entry:
        return False
    if time.time() > entry["expires_at"]:
        OTP_STORE.pop(email.lower(), None)
        return False
    if entry["otp"].strip() == entered_otp.strip():
        OTP_STORE.pop(email.lower(), None)
        return True
    return False

async def send_booking_confirmation_email(
    customer_email: str,
    customer_name: str,
    shop_name: str,
    service_type: str,
    address: str,
    booking_date: str,
    base_price: float,
    booking_id: str
):
    """Send branded confirmation email to customer with hosted Bokivo logo (universally rendered)"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 24px; }}
        .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 18px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
        .logo-wrap {{ text-align: center; margin-bottom: 16px; }}
        .logo-img {{ width: 95px; height: auto; display: block; margin: 0 auto; border: none; }}
        .brand-title {{ font-size: 24px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px; margin-top: 8px; text-align: center; }}
        .badge {{ text-align: center; margin-bottom: 16px; }}
        .badge span {{ background-color: #DCFCE7; color: #166534; font-size: 13px; font-weight: 800; padding: 6px 16px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; }}
        .title {{ font-size: 22px; font-weight: 800; color: #0F172A; text-align: center; margin: 0 0 8px; }}
        .sub {{ font-size: 14px; color: #64748B; text-align: center; margin: 0 0 24px; line-height: 1.5; }}
        .details-box {{ background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 22px; margin-bottom: 24px; }}
        .security-note {{ background-color: #EFF6FF; border-left: 4px solid #38B6FF; padding: 14px 16px; border-radius: 8px; font-size: 13px; color: #1E40AF; margin-bottom: 24px; line-height: 1.4; }}
        .footer {{ font-size: 12px; color: #94A3B8; text-align: center; line-height: 1.5; border-top: 1px solid #E2E8F0; padding-top: 18px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo-wrap">
          <img class="logo-img" src="{LOGO_PUBLIC_URL}" alt="Bokivo" width="95" style="display:block; margin: 0 auto;" />
          <div class="brand-title">BOKIVO</div>
        </div>

        <div class="badge"><span>✓ Appointment Confirmed</span></div>
        <h2 class="title">Booking Confirmation</h2>
        <p class="sub">Hi {customer_name}, your appointment with <strong>{shop_name}</strong> is confirmed!</p>
        
        <div class="details-box">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600; font-size: 14px;">Booking ID</td>
              <td style="padding: 6px 0; color: #0F172A; font-weight: 700; text-align: right; font-size: 14px;">#{str(booking_id)[:8].upper()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600; font-size: 14px;">Service Partner</td>
              <td style="padding: 6px 0; color: #0F172A; font-weight: 700; text-align: right; font-size: 14px;">{shop_name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600; font-size: 14px;">Category</td>
              <td style="padding: 6px 0; color: #0284C7; font-weight: 700; text-align: right; font-size: 14px;">{service_type}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600; font-size: 14px;">Scheduled For</td>
              <td style="padding: 6px 0; color: #0F172A; font-weight: 700; text-align: right; font-size: 14px;">{booking_date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600; font-size: 14px;">Venue Location</td>
              <td style="padding: 6px 0; color: #0F172A; font-weight: 600; text-align: right; font-size: 13px; max-width: 220px;">{address}</td>
            </tr>
            <tr style="border-top: 2px solid #E2E8F0;">
              <td style="padding: 12px 0 0; color: #0F172A; font-weight: 800; font-size: 15px;">Total Payable at Venue</td>
              <td style="padding: 12px 0 0; color: #0284C7; font-weight: 900; text-align: right; font-size: 20px;">₹{base_price}</td>
            </tr>
          </table>
        </div>

        <div class="security-note">
          <strong>Safe & Flexible:</strong> Pay in person upon service completion. Need to reschedule or cancel? Manage it anytime in your Bokivo dashboard.
        </div>

        <div class="footer">
          &copy; 2026 Bokivo Team. All rights reserved. • Automated notification from bokivo.team@gmail.com
        </div>
      </div>
    </body>
    </html>
    """

    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(
            None,
            send_smtp_email,
            customer_email,
            f"Booking Confirmed: {shop_name} on {booking_date}",
            html
        )
        print(f"✓ Booking confirmation email dispatched to {customer_email}")
    except Exception as e:
        print(f"[EMAIL ERROR]: {e}")

async def send_booking_cancellation_email(
    customer_email: str,
    customer_name: str,
    shop_name: str,
    service_type: str,
    booking_date: str,
    booking_id: str,
    cancelled_by: str = "Partner"
):
    """Send branded cancellation email to customer with hosted Bokivo logo and cancellation styling"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 24px; }}
        .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 18px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
        .logo-wrap {{ text-align: center; margin-bottom: 16px; }}
        .logo-img {{ width: 95px; height: auto; display: block; margin: 0 auto; border: none; }}
        .brand-title {{ font-size: 24px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px; margin-top: 8px; text-align: center; }}
        .badge {{ text-align: center; margin-bottom: 16px; }}
        .badge span {{ background-color: #FEE2E2; color: #DC2626; font-size: 13px; font-weight: 800; padding: 6px 16px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; }}
        .title {{ font-size: 22px; font-weight: 800; color: #0F172A; text-align: center; margin: 0 0 8px; }}
        .sub {{ font-size: 14px; color: #64748B; text-align: center; margin: 0 0 24px; line-height: 1.5; }}
        .details-box {{ background: #FEF2F2; border: 1px solid #FECACA; border-radius: 14px; padding: 22px; margin-bottom: 24px; }}
        .cancellation-note {{ background-color: #F8FAFC; border-left: 4px solid #EF4444; padding: 14px 16px; border-radius: 8px; font-size: 13px; color: #475569; margin-bottom: 24px; line-height: 1.5; }}
        .footer {{ font-size: 12px; color: #94A3B8; text-align: center; line-height: 1.5; border-top: 1px solid #E2E8F0; padding-top: 18px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo-wrap">
          <img class="logo-img" src="{LOGO_PUBLIC_URL}" alt="Bokivo" width="95" style="display:block; margin: 0 auto;" />
          <div class="brand-title">BOKIVO</div>
        </div>

        <div class="badge"><span>✕ Appointment Cancelled</span></div>
        <h2 class="title">Booking Cancelled</h2>
        <p class="sub">Hi {customer_name}, your appointment with <strong>{shop_name}</strong> has been cancelled by <strong>{cancelled_by}</strong>.</p>
        
        <div class="details-box">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600; font-size: 14px;">Booking ID</td>
              <td style="padding: 6px 0; color: #0F172A; font-weight: 700; text-align: right; font-size: 14px;">#{str(booking_id)[:8].upper()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600; font-size: 14px;">Service Partner</td>
              <td style="padding: 6px 0; color: #0F172A; font-weight: 700; text-align: right; font-size: 14px;">{shop_name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600; font-size: 14px;">Category</td>
              <td style="padding: 6px 0; color: #0284C7; font-weight: 700; text-align: right; font-size: 14px;">{service_type}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600; font-size: 14px;">Originally Scheduled</td>
              <td style="padding: 6px 0; color: #EF4444; font-weight: 700; text-align: right; font-size: 14px; text-decoration: line-through;">{booking_date}</td>
            </tr>
            <tr style="border-top: 1px solid #FECACA;">
              <td style="padding: 10px 0 0; color: #0F172A; font-weight: 700; font-size: 14px;">Cancellation Fee</td>
              <td style="padding: 10px 0 0; color: #16A34A; font-weight: 800; text-align: right; font-size: 15px;">₹0 (Free)</td>
            </tr>
          </table>
        </div>

        <div class="cancellation-note">
          <strong>No worries:</strong> You have not been charged. The time slot has now been reopened. You can explore and book any other convenient slot anytime on Bokivo.
        </div>

        <div class="footer">
          &copy; 2026 Bokivo Team. All rights reserved. • Automated notification from bokivo.team@gmail.com
        </div>
      </div>
    </body>
    </html>
    """

    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(
            None,
            send_smtp_email,
            customer_email,
            f"Appointment Cancelled: {shop_name} (#{str(booking_id)[:8].upper()})",
            html
        )
        print(f"✓ Booking cancellation email dispatched to {customer_email}")
    except Exception as e:
        print(f"[CANCELLATION EMAIL ERROR]: {e}")

async def send_subscription_receipt_email(
    merchant_email: str,
    merchant_name: str,
    shop_name: str,
    plan_name: str,
    amount: float,
    utr_number: str,
    subscription_end: str
):
    """Send branded subscription invoice & confirmation email to merchant partner"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 24px; }}
        .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 18px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
        .logo-wrap {{ text-align: center; margin-bottom: 16px; }}
        .logo-img {{ width: 95px; height: auto; display: block; margin: 0 auto; border: none; }}
        .brand-title {{ font-size: 24px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px; margin-top: 8px; text-align: center; }}
        .badge {{ text-align: center; margin-bottom: 16px; }}
        .badge span {{ background-color: #DCFCE7; color: #166534; font-size: 13px; font-weight: 800; padding: 6px 16px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; }}
        .title {{ font-size: 22px; font-weight: 800; color: #0F172A; text-align: center; margin: 0 0 8px; }}
        .sub {{ font-size: 14px; color: #64748B; text-align: center; margin: 0 0 24px; line-height: 1.5; }}
        .details-box {{ background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 22px; margin-bottom: 24px; }}
        .perks-box {{ background-color: #EFF6FF; border-left: 4px solid #38B6FF; padding: 14px 16px; border-radius: 8px; font-size: 13px; color: #1E40AF; margin-bottom: 24px; line-height: 1.5; }}
        .footer {{ font-size: 12px; color: #94A3B8; text-align: center; line-height: 1.5; border-top: 1px solid #E2E8F0; padding-top: 18px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo-wrap">
          <img class="logo-img" src="{LOGO_PUBLIC_URL}" alt="Bokivo" width="95" style="display:block; margin: 0 auto;" />
          <div class="brand-title">BOKIVO</div>
        </div>

        <div class="badge"><span>✓ Partner Subscription Active</span></div>
        <h2 class="title">Payment & Subscription Receipt</h2>
        <p class="sub">Hi {merchant_name}, your subscription for <strong>{shop_name}</strong> is now verified and active!</p>
        
        <div class="details-box">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600; font-size: 14px;">Plan</td>
              <td style="padding: 6px 0; color: #0F172A; font-weight: 700; text-align: right; font-size: 14px;">{plan_name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600; font-size: 14px;">UPI UTR / Ref No.</td>
              <td style="padding: 6px 0; color: #0284C7; font-weight: 700; text-align: right; font-size: 14px; font-family: monospace;">{utr_number}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600; font-size: 14px;">Payment Method</td>
              <td style="padding: 6px 0; color: #0F172A; font-weight: 600; text-align: right; font-size: 14px;">Direct UPI QR (0% Fee)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-weight: 600; font-size: 14px;">Valid Until</td>
              <td style="padding: 6px 0; color: #166534; font-weight: 800; text-align: right; font-size: 14px;">{subscription_end}</td>
            </tr>
            <tr style="border-top: 2px solid #E2E8F0;">
              <td style="padding: 12px 0 0; color: #0F172A; font-weight: 800; font-size: 15px;">Amount Paid</td>
              <td style="padding: 12px 0 0; color: #0284C7; font-weight: 900; text-align: right; font-size: 20px;">₹{amount:.2f}</td>
            </tr>
          </table>
        </div>

        <div class="perks-box">
          <strong>Partner Perks Activated:</strong><br/>
          ✓ Priority listing across customer searches in your city<br/>
          ✓ Verified Bokivo Partner trust badge<br/>
          ✓ Real-time appointment slot dispatch & email notifications
        </div>

        <div class="footer">
          &copy; 2026 Bokivo Team. All rights reserved. • Automated notification from bokivo.team@gmail.com
        </div>
      </div>
    </body>
    </html>
    """

    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(
            None,
            send_smtp_email,
            merchant_email,
            f"Bokivo Partner Subscription Verified - {shop_name}",
            html
        )
        print(f"✓ Subscription receipt email dispatched to {merchant_email}")
    except Exception as e:
        print(f"[RECEIPT EMAIL ERROR]: {e}")
