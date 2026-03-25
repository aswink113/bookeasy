import uuid
import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from core.models import User, Merchant, Booking

class Command(BaseCommand):
    help = 'Seeds the database with professional demo data'

    def handle(self, *args, **options):
        self.stdout.write('Purging old intelligence data...')
        Booking.objects.all().delete()
        Merchant.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write('Initializing data generation sequence...')

        # 1. Generate Global Master Users
        users = []
        roles = ['customer', 'merchant']
        segments = ['Airlines', 'Luxury Spa', 'Enterprise Concierge', 'Healthcare Elite', 'Private Dining']
        
        # Create a pool of users
        for i in range(20):
            role = 'merchant' if i < 8 else 'customer'
            u = User.objects.create(
                name=f"Elite Partner {i+1}" if role == 'merchant' else f"Platinum Client {i-7}",
                email=f"partner{i}@bookeasy.intel" if role == 'merchant' else f"client{i}@gmail.com",
                password_hash="pbkdf2_sha256$600000$...", 
                role=role
            )
            users.append(u)

        # 2. Create Merchants with Premium Profiles
        merchants = []
        shop_names = [
            "Azure Sky Lounge", "Emerald Wellness", "Titan Logistics", 
            "Regency Suites", "Onyx Dining", "Velvet Spa", 
            "Global Jet Solutions", "Ivory Health"
        ]
        
        for i, name in enumerate(shop_names):
            m = Merchant.objects.create(
                user=users[i],
                shop_name=name,
                address=f"Global Hub Suite {100 + i}, Financial District",
                service_type=segments[i % len(segments)],
                base_price=random.randint(500, 5000),
                rating=random.uniform(4.5, 5.0),
                is_subscribed=(i < 5), # First 5 are premium
                subscription_end=timezone.now() + timedelta(days=random.randint(30, 365)) if i < 5 else None
            )
            merchants.append(m)

        # 3. Create Real-time Transaction Ledger (Bookings)
        statuses = ['pending', 'accepted', 'completed', 'cancelled']
        customers = [u for u in users if u.role == 'customer']
        
        for _ in range(30):
            Booking.objects.create(
                customer=random.choice(customers),
                merchant=random.choice(merchants),
                status=random.choice(statuses),
                booking_date=timezone.now() + timedelta(days=random.randint(-10, 10)),
                created_at=timezone.now() - timedelta(hours=random.randint(1, 100))
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with premium data.'))
