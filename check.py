import tensorflow as tf
model = tf.keras.models.load_model(
    "/home/yash-jadhav/ML/Image_Classification/vgg16_sports_classifier.keras",
    compile=False
)

model.summary()