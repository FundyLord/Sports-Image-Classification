from django.test import TestCase
from rest_framework.test import APIClient

class HealthCheckTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_endpoint(self):
        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, 500)

        # NEW: Validate response content
        self.assertIn("status", response.data)
        self.assertEqual(response.data["status"], "healthy")