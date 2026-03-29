import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from issues.models import Issue

User = get_user_model()

# Create citizen user
citizen, created = User.objects.get_or_create(username='citizen_john', email='citizen@example.com')
if created: 
    citizen.set_password('password123')
    citizen.role = 'citizen'
    citizen.save()

# Create gov employee
gov, created = User.objects.get_or_create(username='admin', email='admin@example.com')
if created:
    gov.set_password('admin123')
    gov.is_superuser = True
    gov.is_staff = True
    gov.role = 'gov_employee'
    gov.save()

# Create generic issue
if not Issue.objects.exists():
    Issue.objects.create(
        author=citizen,
        title='Massive Pothole on 5th Ave',
        description='A huge pothole has formed and is causing heavy traffic congestion and car damage.',
        category='road',
        urgency=3,
        location='5th Ave & 23rd St',
        status='pending'
    )
print("Dummy data successfully populated.")
