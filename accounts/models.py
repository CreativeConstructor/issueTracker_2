from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        CITIZEN = 'citizen', 'Citizen'
        GOV_EMPLOYEE = 'gov_employee', 'Government Employee'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CITIZEN)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
