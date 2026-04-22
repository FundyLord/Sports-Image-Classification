from django.test import TestCase
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.models import User
import os

class HealthCheckTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_endpoint(self):
        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, 200)

        # NEW: Validate response content
        self.assertIn("status", response.data)
        self.assertEqual(response.data["status"], "healthy")

class PredictionTest(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create test user
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass"
        )

        # Authenticate the client
        self.client.force_authenticate(user=self.user)

    def test_prediction_endpoint(self):
        image_path = os.path.join("media", "test.jpg")

        with open(image_path, "rb") as img:
            image = SimpleUploadedFile(
                name="test.jpg",
                content=img.read(),
                content_type="image/jpeg"
            )

        response = self.client.post(
            "/api/predict/",
            {"image": image},
            format='multipart'
        )

        self.assertIn(response.status_code, [200, 201])

        # Validate prediction field
        self.assertIn("sport", response.data)
        self.assertIsInstance(response.data["sport"], str)
        self.assertNotEqual(response.data["sport"], "")

        # Validate confidence
        self.assertIn("confidence", response.data)
        self.assertGreaterEqual(response.data["confidence"], 0)
        self.assertLessEqual(response.data["confidence"], 100)