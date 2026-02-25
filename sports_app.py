import streamlit as st
import tensorflow as tf
from PIL import Image
import numpy as np
import os

# Load the trained model
model = tf.keras.models.load_model("vgg16_sports_classifier.keras")

# Get class names from the training directory
class_dir = "sports-classification/train"
class_names = sorted(os.listdir(class_dir))

# Streamlit UI setup
st.set_page_config(page_title="🏅 Sports Classifier", layout="centered")
st.title("🏅 Sports Image Classifier")
st.markdown("""
Upload, drag-and-drop, **paste (Ctrl + V)**, or **take a photo** to classify a sports image using a trained VGG16 model.
""")

# Upload via file or drag-and-drop
uploaded_file = st.file_uploader(
    "Upload or drag a sports image (JPG/PNG)", 
    type=["jpg", "jpeg", "png"]
)

# Camera input or paste (via Ctrl+V after copying an image)
st.markdown("Or paste an image (Ctrl+V) or take a photo using your camera:")
camera_image = st.camera_input("Camera or Clipboard Image Input")

# Choose whichever input is available
image_source = uploaded_file or camera_image

if image_source:
    image = Image.open(image_source).convert("RGB").resize((224, 224))
    st.image(image, caption="Uploaded Image", use_column_width=True)

    # Preprocess
    img_array = np.array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # Predict
    prediction = model.predict(img_array)
    predicted_class = class_names[np.argmax(prediction)]
    confidence = np.max(prediction) * 100

    st.success(f"**Prediction:** `{predicted_class}` with **{confidence:.2f}%** confidence")
