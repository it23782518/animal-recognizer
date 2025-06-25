# server/predict.py
import sys
import json
import numpy as np
import os

# Suppress TensorFlow warnings and info messages
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf
tf.get_logger().setLevel('ERROR')

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

# Load model and labels once
model_path = os.path.join(project_root, 'models', 'animal_model.h5')
labels_path = os.path.join(project_root, 'utils', 'labels.json')

try:
    model = load_model(model_path, compile=False)
    with open(labels_path) as f:
        labels = json.load(f)
    labels = {v: k for k, v in labels.items()}
except Exception as e:
    print(f"Error loading model or labels: {e}")
    sys.exit(1)

def predict_image(image_path):
    try:
        img = image.load_img(image_path, target_size=(224, 224))  # ✅ Fix input size
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        preds = model.predict(img_array, verbose=0)
        class_id = np.argmax(preds[0])
        return labels[class_id]
    except Exception as e:
        return "Error"

# CLI usage
if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Error: No image path provided")
        sys.exit(1)

    path = sys.argv[1]
    if not os.path.exists(path):
        print(f"Error: Image file not found: {path}")
        sys.exit(1)

    result = predict_image(path)
    print(result)
