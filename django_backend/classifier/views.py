"""
API views for Live Active - Sports Mapping Application.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from django.contrib.auth.models import User
from django.core.files.base import ContentFile

from .model_utils import get_classifier
from .models import SportSighting


class RegisterView(APIView):
    """
    POST /api/register/
    Create a new user account.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        email = request.data.get('email', '').strip()
        
        # Validation
        if not username or not password:
            return Response(
                {'error': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(password) < 6:
            return Response(
                {'error': 'Password must be at least 6 characters.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already taken.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email
        )
        
        return Response({
            'success': True,
            'message': 'Account created successfully.',
            'user': {'id': user.id, 'username': user.username}
        }, status=status.HTTP_201_CREATED)


class PredictAndSaveView(APIView):
    """
    POST /api/predict/
    Classify a sports image and save the sighting with location.
    Requires JWT authentication.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        # Validate image
        if 'image' not in request.FILES:
            return Response(
                {'error': 'No image file provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image_file = request.FILES['image']
        
        # Validate coordinates
        try:
            lat = float(request.data.get('lat', 0))
            lng = float(request.data.get('lng', 0))
        except (TypeError, ValueError):
            return Response(
                {'error': 'Invalid coordinates. Provide lat and lng as numbers.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        if image_file.content_type not in allowed_types:
            return Response(
                {'error': f'Invalid file type. Allowed: JPEG, PNG, WebP'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 10MB)
        if image_file.size > 10 * 1024 * 1024:
            return Response(
                {'error': 'File too large. Maximum size is 10MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Run ML prediction
            classifier = get_classifier()
            image_bytes = image_file.read()
            predictions = classifier.predict(image_bytes, top_k=1)
            top_prediction = predictions[0]
            
            # Reset file pointer for saving
            image_file.seek(0)
            
            # Save sighting to database
            sighting = SportSighting.objects.create(
                user=request.user,
                sport=top_prediction['sport'],
                confidence=top_prediction['confidence'],
                latitude=lat,
                longitude=lng,
                image=image_file
            )
            
            return Response({
                'id': sighting.id,
                'sport': sighting.sport,
                'confidence': sighting.confidence,
                'lat': sighting.latitude,
                'lng': sighting.longitude,
                'user': request.user.username,
                'image_url': request.build_absolute_uri(sighting.image.url),
                'created_at': sighting.created_at.isoformat()
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Prediction failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SightingsListView(APIView):
    """
    GET /api/sightings/
    Returns sport sightings for displaying on the map.
    
    Query Parameters:
        - mine: If 'true' and authenticated, returns only the current user's sightings
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Check if user wants only their own sightings
        mine_only = request.query_params.get('mine', '').lower() == 'true'
        
        if mine_only:
            # Requires authentication for personal sightings
            if not request.user.is_authenticated:
                return Response(
                    {'error': 'Authentication required to view your sightings.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            sightings = SportSighting.objects.filter(user=request.user)[:100]
        else:
            sightings = SportSighting.objects.all()[:100]  # Limit to last 100
        
        data = []
        for s in sightings:
            data.append({
                'id': s.id,
                'sport': s.sport,
                'confidence': s.confidence,
                'lat': s.latitude,
                'lng': s.longitude,
                'user': s.user.username,
                'image_url': request.build_absolute_uri(s.image.url),
                'created_at': s.created_at.isoformat()
            })
        
        return Response(data)


class HealthCheckView(APIView):
    """Simple health check endpoint."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            'status': 'healthy',
            'model_loaded': True,
            'num_classes': len(settings.SPORTS_CLASSES)
        })


class SportsListView(APIView):
    """Return the list of all sports the model can classify."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            'count': len(settings.SPORTS_CLASSES),
            'sports': [s.title() for s in settings.SPORTS_CLASSES]
        })
