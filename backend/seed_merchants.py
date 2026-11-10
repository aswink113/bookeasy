import asyncio, asyncpg, uuid, bcrypt

async def seed():
    conn = await asyncpg.connect('postgresql://postgres:postgress@localhost:5432/bookivo')
    pw_hash = bcrypt.hashpw(b'password123', bcrypt.gensalt()).decode('utf-8')
    
    sample_merchants = [
        ('Urban Cut Studio', '100ft Road, Indiranagar, Bangalore, India', 'Salon', 350, 4.8, 12.9716, 77.6412),
        ('Aura Spa & Wellness', '4th Block, Koramangala, Bangalore, India', 'Spa & Massage', 1200, 4.9, 12.9352, 77.6245),
        ('SpeedyWash Car Detailing', 'Sector 2, HSR Layout, Bangalore, India', 'Car Detailing', 650, 4.7, 12.9121, 77.6446),
        ('Zenith Dental & Smile Clinic', 'Church Street, Bangalore, India', 'Dental Clinic', 800, 4.9, 12.9749, 77.6033),
        ('Luxe Nails & Glow Lounge', 'MG Road, Bangalore, India', 'Salon', 550, 4.6, 12.9756, 77.6066),
        ('Downtown Barber & Co.', 'Manhattan, New York, USA', 'Salon', 2800, 4.9, 40.7128, -74.0060),
        ('SoHo Wellness Sanctuary', 'SoHo, London, UK', 'Spa & Massage', 3500, 4.8, 51.5136, -0.1365),
        ('Shibuya Precision Grooming', 'Shibuya, Tokyo, Japan', 'Salon', 2200, 4.9, 35.6580, 139.7016),
        ('Marina Auto Spa', 'Dubai Marina, Dubai, UAE', 'Car Detailing', 3100, 4.7, 25.0805, 55.1403),
        ('Bondi Beach Holistic Spa', 'Bondi, Sydney, Australia', 'Spa & Massage', 2900, 4.8, -33.8915, 151.2767),
        ('Colaba Salon Prestige', 'Colaba, Mumbai, India', 'Salon', 650, 4.8, 18.9067, 72.8147),
        ('Connaught Wellness Hub', 'Connaught Place, New Delhi, India', 'Spa & Massage', 1400, 4.7, 28.6315, 77.2167),
    ]
    
    for i, (shop_name, address, service, price, rating, lat, lng) in enumerate(sample_merchants):
        u_id = uuid.uuid4()
        clean_name = ''.join(c for c in shop_name if c.isalnum()).lower()
        email = f"merchant{i}_{clean_name}@bokivo.com"
        await conn.execute(
            'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
            u_id, shop_name, email, pw_hash, 'merchant'
        )
        await conn.execute(
            '''INSERT INTO merchants (id, shop_name, address, service_type, base_price, rating, latitude, longitude, is_subscribed)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING''',
            u_id, shop_name, address, service, price, rating, lat, lng, True
        )
    print('Sample global merchants seeded successfully')
    await conn.close()

if __name__ == '__main__':
    asyncio.run(seed())

