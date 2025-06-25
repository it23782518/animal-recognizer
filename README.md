# Animal Recognizer

A web application for recognizing animal images using machine learning.

## Overview
This application uses a trained machine learning model to identify animals in uploaded images. It features a Next.js frontend and a Python backend for image processing and prediction.

## Features
- Upload images to identify animals
- Real-time prediction using a pre-trained TensorFlow model
- Responsive UI built with Next.js and Tailwind CSS

## Tech Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Python (TensorFlow/Keras)
- **API**: Next.js API routes

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/it23782518/animal-recognizer.git
   cd animal-recognizer
   ```

2. Install JavaScript dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Install Python dependencies
   ```bash
   pip install tensorflow pillow numpy
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project can be deployed on Vercel. For optimal performance, you may need to configure Vercel to properly handle the Python backend.

### Special Deployment Considerations for Animal Recognizer

When deploying this application to Vercel, there are several specific considerations:

1. **Python Backend**: Vercel requires special configuration for Python serverless functions:
   - Create a `vercel.json` file in the root directory with the following content:
     ```json
     {
       "functions": {
         "src/server/*.py": {
           "runtime": "vercel-python@3.1.0"
         }
       },
       "routes": [
         { "src": "/api/predict", "dest": "/api/predict.ts" }
       ]
     }
     ```

2. **Machine Learning Model**:
   - The large ML model file (`animal_model.h5`) may exceed Vercel's size limits
   - Consider uploading the model to a cloud storage service (AWS S3, Google Cloud Storage) 
   - Modify the prediction code to download the model at runtime
   - Alternatively, convert the model to a smaller format (TensorFlow.js, ONNX, etc.)

3. **Dependencies**:
   - Create a `requirements.txt` file in the root directory:
     ```
     tensorflow==2.9.0
     pillow==9.2.0
     numpy==1.23.1
     ```

4. **Memory and Timeout Limits**:
   - Vercel has a default timeout of 10 seconds for serverless functions
   - Model loading and inference may exceed this limit
   - Consider optimizing your model or upgrading to a paid plan for higher limits

### Vercel Deployment Troubleshooting

If you encounter any of the following common errors when deploying to Vercel, here are some troubleshooting steps:

#### Function-related Errors
- `FUNCTION_INVOCATION_FAILED` (500): Check your Python code for errors. Ensure all dependencies are properly installed.
- `FUNCTION_INVOCATION_TIMEOUT` (504): Your function is taking too long to respond. Optimize your model loading or use serverless functions with longer timeout settings.
- `FUNCTION_PAYLOAD_TOO_LARGE` (413): The image being uploaded is too large. Implement client-side image compression or set a size limit.

#### Deployment Errors
- `DEPLOYMENT_NOT_FOUND` (404): Make sure your deployment exists and hasn't been deleted.
- `DEPLOYMENT_DISABLED` (402): Your deployment might require a paid plan or has been disabled. Check your Vercel account status.
- `DEPLOYMENT_DELETED` (410): This occurs when a request is made to a deployment that has been removed according to your project's deployment retention policy. To restore a deleted deployment:
  1. Go to your project's Settings tab in Vercel
  2. Select Security on the side panel
  3. Scroll down to the "Recently Deleted" section
  4. Find your deployment and click the dropdown menu
  5. Select "Restore" and complete the restoration process
  
  Note: Deleted deployments can only be restored within 30 days of deletion.

#### Common Solutions
1. Use Vercel environment variables for configuration
2. Ensure all Python dependencies are listed in `requirements.txt`
3. For large ML models, consider storing them on a cloud storage service and downloading at runtime
4. Check Vercel logs for detailed error information

For a complete list of Vercel error codes and solutions, refer to the [Vercel Documentation](https://vercel.com/docs/errors).
