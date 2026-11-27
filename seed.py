"""Fill the database with 40 sample Chennai properties:  python seed.py"""
import random
from datetime import date, timedelta

from app.database import Base, engine, SessionLocal
from app import models

random.seed(7)
Base.metadata.create_all(bind=engine)

LOCALITIES = ["T. Nagar", "Guindy", "Anna Nagar", "OMR", "Velachery", "Adyar", "Ambattur", "Porur", "Nungambakkam", "Perungudi"]
TYPES = {
    "office": (400, 6000, (60, 130)),
    "shop": (150, 2500, (90, 220)),
    "warehouse": (1500, 25000, (18, 40)),
}
BROKERS = ["Ravi Kumar", "Priya Natarajan", "Suresh Babu", "Meena Iyer", "Arjun Reddy"]
OWNERS = ["S. Venkatesh", "R. Lakshmi", "K. Murugan", "A. Fathima", "M. Selvam"]

db = SessionLocal()
if db.query(models.Property).count():
    print("Database already has data. Skipping seed.")
else:
    for i in range(40):
        ptype = random.choice(list(TYPES))
        lo, hi, (rate_lo, rate_hi) = TYPES[ptype]
        size = random.randrange(lo, hi, 50)
        rent = round(size * random.randint(rate_lo, rate_hi), -2)
        loc = random.choice(LOCALITIES)
        prop = models.Property(
            title=f"{size} sq ft {ptype} in {loc}",
            description=f"Well-maintained {ptype} space in {loc} with power backup, parking and easy road access.",
            property_type=ptype, city="Chennai", locality=loc,
            address=f"{random.randint(1, 250)}, Main Road, {loc}, Chennai",
            size_sqft=size, monthly_rent=rent,
            deposit=rent * random.choice([3, 4, 6, 6, 10]),
            available_from=date.today() + timedelta(days=random.randint(0, 90)),
        )
        prop.photos = [
            models.Photo(url=f"https://picsum.photos/seed/pf{i}{n}/900/600", is_primary=(n == 0))
            for n in range(3)
        ]
        prop.contacts = [
            models.Contact(name=random.choice(OWNERS), role="owner", phone=f"+91 98{random.randint(10000000, 99999999)}"),
            models.Contact(name=random.choice(BROKERS), role="broker", phone=f"+91 97{random.randint(10000000, 99999999)}", email="broker@example.com"),
        ]
        db.add(prop)
    db.commit()
    print("Seeded 40 properties.")
db.close()
