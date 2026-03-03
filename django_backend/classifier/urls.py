"""
URL routes for the classifier app.
"""
from django.urls import path
from .views import (
    RegisterView,
    PredictAndSaveView,
    SightingsListView,
    HealthCheckView,
    SportsListView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('predict/', PredictAndSaveView.as_view(), name='predict'),
    path('sightings/', SightingsListView.as_view(), name='sightings'),
    path('health/', HealthCheckView.as_view(), name='health'),
    path('sports/', SportsListView.as_view(), name='sports-list'),
]
