from django.db import models
from django.contrib.auth.models import User


class SportSighting(models.Model):
    """
    Stores a sport sighting with location, image, and prediction.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sightings')
    sport = models.CharField(max_length=100)
    confidence = models.FloatField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    image = models.ImageField(upload_to='sightings/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.sport} by {self.user.username} at ({self.latitude}, {self.longitude})"
