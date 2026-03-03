"""
Model utilities for loading and running inference with the PyTorch sports classifier.
"""
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
from django.conf import settings


def create_model(num_classes=100, activation_type='gelu'):
    """
    Recreates the exact same model architecture used during training.
    Uses ResNet18 with a custom classification head.
    """
    # Setup the activation function
    if activation_type == 'relu':
        activation = nn.ReLU()
    elif activation_type == 'gelu':
        activation = nn.GELU()
    elif activation_type == 'leaky_relu':
        activation = nn.LeakyReLU(negative_slope=0.01)
    else:
        activation = nn.GELU()

    # Load ResNet18 backbone (without pretrained weights, we'll load our own)
    model = models.resnet18(weights=None)
    in_features = model.fc.in_features
    
    # Replace the classification head with our custom architecture
    model.fc = nn.Sequential(
        nn.Linear(in_features, 512),
        activation,
        nn.Dropout(p=0.5),
        nn.Linear(512, num_classes)
    )
    
    return model


class SportsClassifier:
    """Singleton class to load model once and reuse for all predictions."""
    
    _instance = None
    _model = None
    _device = None
    _transform = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Load the model and set up transforms."""
        # Determine device
        self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {self._device}")
        
        # Create model architecture
        self._model = create_model(
            num_classes=len(settings.SPORTS_CLASSES),
            activation_type='gelu'
        )
        
        # Load trained weights
        checkpoint_path = settings.MODEL_PATH
        print(f"Loading model from: {checkpoint_path}")
        
        state_dict = torch.load(checkpoint_path, map_location=self._device, weights_only=True)
        self._model.load_state_dict(state_dict)
        self._model.to(self._device)
        self._model.eval()
        
        # Define the same transform used during training (ImageNet normalization)
        self._transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        print("Model loaded successfully!")
    
    def predict(self, image_bytes, top_k=5):
        """
        Run inference on an image.
        
        Args:
            image_bytes: Raw image bytes from uploaded file
            top_k: Number of top predictions to return
            
        Returns:
            List of dicts with 'sport' and 'confidence' keys
        """
        # Load and preprocess image
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        input_tensor = self._transform(image).unsqueeze(0).to(self._device)
        
        # Run inference
        with torch.no_grad():
            outputs = self._model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]
        
        # Get top K predictions
        top_probs, top_indices = torch.topk(probabilities, top_k)
        
        predictions = []
        for i in range(top_k):
            sport_name = settings.SPORTS_CLASSES[top_indices[i].item()]
            confidence = top_probs[i].item() * 100
            predictions.append({
                'sport': sport_name.title(),
                'confidence': round(confidence, 2)
            })
        
        return predictions


# Global instance for easy access
def get_classifier():
    """Get the singleton classifier instance."""
    return SportsClassifier()
