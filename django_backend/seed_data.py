"""
Django Database Seeder Script
"""

import random
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from django.core.files.base import ContentFile
from django.contrib.auth.models import User

from classifier.models import SportSighting

# Configuration
USERNAMES = ['Daksh', 'Pooja', 'Ganesh']
PASSWORD = '123456'
PINS_PER_USER = 10
SPORTS = ['air hockey', 'ampute football', 'archery', 'arm wrestling']

# Mumbai coordinates
BASE_LAT = 19.0760
BASE_LNG = 72.8777
OFFSET_RANGE = 0.05


def generate_sample_image(text="Sample Image", width=400, height=300):
    """Generate a simple colored image with text using PIL."""
    # Random background color
    bg_color = (
        random.randint(100, 200),
        random.randint(100, 200),
        random.randint(100, 200)
    )
    
    # Create image
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a larger font, fall back to default if not available
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
    except (IOError, OSError):
        try:
            font = ImageFont.truetype("arial.ttf", 32)
        except (IOError, OSError):
            font = ImageFont.load_default()
    
    # Calculate text position (center)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Draw text with shadow for visibility
    shadow_color = (0, 0, 0)
    text_color = (255, 255, 255)
    draw.text((x + 2, y + 2), text, font=font, fill=shadow_color)
    draw.text((x, y), text, font=font, fill=text_color)
    
    # Save to BytesIO
    buffer = BytesIO()
    img.save(buffer, format='JPEG', quality=85)
    buffer.seek(0)
    
    return buffer


def create_users():
    """Create users if they don't exist."""
    users = []
    for username in USERNAMES:
        user, created = User.objects.get_or_create(username=username)
        if created:
            user.set_password(PASSWORD)
            user.save()
            print(f"Created user: {username}")
        else:
            print(f"User already exists: {username}")
        users.append(user)
    return users


def create_pins(users):
    """Create 10 pins for each user."""
    total_created = 0
    
    for user in users:
        print(f"\nCreating pins for {user.username}...")
        
        for i in range(PINS_PER_USER):
            # Random sport
            sport = random.choice(SPORTS)
            
            # Mumbai coordinates with random offset
            lat = BASE_LAT + random.uniform(-OFFSET_RANGE, OFFSET_RANGE)
            lng = BASE_LNG + random.uniform(-OFFSET_RANGE, OFFSET_RANGE)
            
            # Generate image
            image_buffer = generate_sample_image(f"Sample Image")
            image_content = ContentFile(image_buffer.read())
            filename = f"{user.username.lower()}_{sport.replace(' ', '_')}_{i+1}.jpg"
            
            # Create the pin
            pin = SportSighting(
                user=user,
                sport=sport,
                latitude=lat,
                longitude=lng,
                confidence=random.uniform(70, 99)
            )
            pin.image.save(filename, image_content, save=True)
            
            total_created += 1
            print(f"  Created pin {i+1}: {sport} at ({lat:.4f}, {lng:.4f})")
    
    return total_created


def main():
    print("=" * 50)
    print("Django Database Seeder")
    print("=" * 50)
    
    # Create users
    print("\n[1/2] Creating users...")
    users = create_users()
    
    # Create pins
    print("\n[2/2] Creating pins...")
    total = create_pins(users)
    
    print("\n" + "=" * 50)
    print(f"Seeding complete! Created {total} pins for {len(users)} users.")
    print("=" * 50)


# Run the seeder
main()
