from flask import Flask, request, jsonify, render_template
from PIL import Image
import tensorflow as tf
import numpy as np

app = Flask(__name__, template_folder="templates")

# Load the trained model
model = tf.keras.models.load_model(
    "/home/yash-jadhav/ML/Image_Classification/vgg16_sports_classifier.keras",
    compile=False
)

# 100 sports classes
class_names = [
    "air hockey", "ampute football", "archery", "arm wrestling", "axe throwing",
    "balance beam", "barell racing", "baseball", "basketball", "baton twirling",
    "bike polo", "billiards", "bmx", "bobsled", "bowling", "boxing", "bull riding",
    "bungee jumping", "canoe slamon", "cheerleading", "chuckwagon racing", "cricket",
    "croquet", "curling", "disc golf", "fencing", "field hockey", "figure skating men",
    "figure skating pairs", "figure skating women", "fly fishing", "football",
    "formula 1 racing", "frisbee", "gaga", "giant slalom", "golf", "hammer throw",
    "hang gliding", "harness racing", "high jump", "hockey", "horse jumping",
    "horse racing", "horseshoe pitching", "hurdles", "hydroplane racing",
    "ice climbing", "ice yachting", "jai alai", "javelin", "jousting", "judo",
    "lacrosse", "log rolling", "luge", "motorcycle racing", "mushing", "nascar racing",
    "olympic wrestling", "parallel bar", "pole climbing", "pole dancing", "pole vault",
    "polo", "pommel horse", "rings", "rock climbing", "roller derby", "rollerblade racing",
    "rowing", "rugby", "sailboat racing", "shot put", "shuffleboard", "sidecar racing",
    "ski jumping", "sky surfing", "skydiving", "snow boarding", "snowmobile racing",
    "speed skating", "steer wrestling", "sumo wrestling", "surfing", "swimming",
    "table tennis", "tennis", "track bicycle", "trapeze", "tug of war", "ultimate",
    "uneven bars", "volleyball", "water cycling", "water polo", "weightlifting",
    "wheelchair basketball", "wheelchair racing", "wingsuit flying"
]

# Preprocessing function
def preprocess_image(image):
    image = image.resize((224, 224))  # Resize to match VGG16 input
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

# ✅ New GET route to serve the HTML page
@app.route("/", methods=["GET"])
def index():
    return render_template("/home/yash-jadhav/ML/Image_Classification/frontend/index.html")

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    image = Image.open(image_file).convert("RGB")
    input_data = preprocess_image(image)

    predictions = model.predict(input_data)
    predicted_index = np.argmax(predictions)
    predicted_label = class_names[predicted_index]
    confidence = float(np.max(predictions))

    return jsonify({
        "prediction": predicted_label,
        "confidence": round(confidence * 100, 2)
    })

if __name__ == "__main__":
    app.run(debug=True)
