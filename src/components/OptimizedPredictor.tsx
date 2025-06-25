// components/OptimizedPredictor.tsx
import React, { useState } from 'react';
import { Upload, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function OptimizedPredictor() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setResult(null);
    setError(null);
    
    if (file) {
      // Size validation (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        setImagePreview(base64Image);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleUpload = async () => {
    if (!imagePreview) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Send the base64 image directly to the optimized API
      const res = await fetch('/api/predict-optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imagePreview }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error ?? 'Prediction failed');
      }
      
      setResult(data.prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = () => {
    // This would handle camera capture in a real implementation
    alert("Camera functionality would be implemented here");
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Animal Recognizer - Optimized for Vercel
      </h2>
      
      <div className="w-full p-6 bg-white rounded-lg shadow-md mb-6">
        <div className="flex justify-center space-x-4 mb-6">
          <label className="flex flex-col items-center justify-center w-1/2 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="text-sm text-gray-500">Upload Image</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
          
          <button 
            onClick={handleCapture}
            className="flex flex-col items-center justify-center w-1/2 h-32 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Camera className="w-8 h-8 mb-2 text-gray-500" />
            <p className="text-sm text-gray-500">Take Photo</p>
          </button>
        </div>
        
        {imagePreview && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
        
        <button
          onClick={handleUpload}
          disabled={!imagePreview || loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            !imagePreview || loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Recognizing...
            </span>
          ) : (
            'Recognize Animal'
          )}
        </button>
      </div>
      
      {error && (
        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {result && (
        <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Animal Recognized:</p>
              <p className="text-lg font-bold text-green-900">{result}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          This version uses base64 image transfer and is optimized for serverless environments like Vercel.
        </p>
      </div>
    </div>
  );
}
