from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('register-gov/', views.register_gov_view, name='register_gov'),
    path('api/register/', views.register_user, name='register_api'),
]