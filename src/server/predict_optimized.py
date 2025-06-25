# server/predict_optimized.py
import sys
import json
import numpy as np
import os
import base64
from io import BytesIO
from PIL import Image

# Suppress TensorFlow warnings and info messages
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf
tf.get_logger().setLevel('ERROR')

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Define the path for the temporary model download
TMP_MODEL_PATH = '/tmp/animal_model.h5'
MODEL_URL = 'YOUR_CLOUD_STORAGE_URL' # Replace with your cloud storage URL

# Function to download model if it doesn't exist
def ensure_model_exists():
    if not os.path.exists(TMP_MODEL_PATH):
        try:
            # For simplicity, we'll use a placeholder here
            # In a real implementation, you would download from S3/GCS/etc.
            # Example: import urllib.request; urllib.request.urlretrieve(MODEL_URL, TMP_MODEL_PATH)
            print("Would download model from cloud storage to temp location")
            
            # For now, we'll look for the model in the project directory
            script_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.dirname(script_dir)
            model_path = os.path.join(project_root, 'models', 'animal_model.h5')
            
            # In a real deployment, you would replace this with the download code
            if os.path.exists(model_path):
                import shutil
                shutil.copyfile(model_path, TMP_MODEL_PATH)
            else:
                print(f"Model not found at {model_path}")
        except Exception as e:
            print(f"Error downloading model: {e}")
            return False
    return True

# Load labels
def load_labels():
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        labels_path = os.path.join(project_root, 'utils', 'labels.json')
        
        with open(labels_path) as f:
            labels = json.load(f)
        return {v: k for k, v in labels.items()}
    except Exception as e:
        print(f"Error loading labels: {e}")
        return {}

# Predict from base64 image string
def predict_from_base64(base64_string):
    try:
        # Ensure model is available
        if not ensure_model_exists():
            return "Error: Model not available"
            
        # Load the model
        model = load_model(TMP_MODEL_PATH, compile=False)
        
        # Load labels
        labels = load_labels()
        if not labels:
            return "Error: Labels not available"
            
        # Decode and process the image
        img_data = base64.b64decode(base64_string.split(',')[1] if ',' in base64_string else base64_string)
        img = Image.open(BytesIO(img_data))
        img = img.resize((224, 224))
        
        img_array = np.array(img) / 255.0
        if img_array.shape[2] == 4:  # If RGBA, convert to RGB
            img_array = img_array[:,:,:3]
        img_array = np.expand_dims(img_array, axis=0)
        
        # Make prediction
        preds = model.predict(img_array, verbose=0)
        class_id = np.argmax(preds[0])
        
        return labels[class_id]
    except Exception as e:
        print(f"Prediction error: {e}")
        return f"Error: {str(e)}"

# For API handler
def api_predict(base64_image):
    result = predict_from_base64(base64_image)
    return json.dumps({"prediction": result})

# For CLI testing
if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Error: No base64 image provided")
        sys.exit(1)
    
    result = predict_from_base64(sys.argv[1])
    print(result)
