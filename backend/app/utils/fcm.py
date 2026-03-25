import firebase_admin
from firebase_admin import credentials, messaging
from app.core.config import settings

def init_firebase():
    """
    Initializes Firebase Admin SDK.
    Requires a valid service account JSON.
    """
    if not settings.FIREBASE_SERVICE_ACCOUNT_JSON:
        print("FCM: Warning! No service account JSON provided. Push notifications will fail.")
        return
        
    cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
    firebase_admin.initialize_app(cred)

async def send_push_notification(fcm_token: str, title: str, body: str, data: dict = None):
    """
    Sends an FCM message to a single device.
    """
    if not fcm_token:
        return
        
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=fcm_token,
        data=data or {},
    )
    
    try:
        response = messaging.send(message)
        print(f"FCM: Successfully sent message to {fcm_token}, response: {response}")
    except Exception as e:
        print(f"FCM: Error sending message: {e}")
