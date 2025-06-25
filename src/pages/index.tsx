import { useState } from 'react';
import { Upload, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVercelNote, setShowVercelNote] = useState(true);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setResult(null);
    setError(null);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('image', image);

      const res = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error ?? 'Prediction failed');
      }
      
      setResult(data.prediction);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">          <h1 className="text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <Camera className="text-indigo-600" size={48} />
            Animal Recognizer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
            Upload an image of an animal and let our AI identify what type of animal it is.
          </p>
          
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Upload Section */}
              <div className="p-8 border-r border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Upload size={24} className="text-indigo-600" />
                  Upload Image
                </h2>
                
                {/* File Upload Area */}
                <div className="mb-6">
                  <label 
                    htmlFor="file-upload"
                    className="relative block w-full h-64 border-2 border-dashed border-indigo-300 rounded-xl hover:border-indigo-400 transition-colors cursor-pointer group"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-600 group-hover:text-indigo-700">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (                        <>
                          <Upload size={48} className="mb-4" />
                          <p className="text-lg font-medium">Click to upload image</p>
                          <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                          
                        </>
                      )}
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={!image || loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Camera size={20} />
                        Identify Animal
                      </>
                    )}
                  </button>
                  
                  {(image || result || error) && (
                    <button
                      onClick={resetApp}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Results Section */}
              <div className="p-8 bg-gray-50">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  Results
                </h2>
                
                <div className="h-64 flex items-center justify-center">
                  {loading && (
                    <div className="text-center">
                      <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
                      <p className="text-gray-600">Analyzing your image...</p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="text-center">
                      <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                      <p className="text-red-600 font-medium mb-2">Error occurred</p>
                      <p className="text-gray-600 text-sm">{error}</p>
                    </div>
                  )}
                    {result && !loading && (
                    <div className="text-center">
                      <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                      <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
                        {imagePreview && (
                          <img 
                            src={imagePreview} 
                            alt="Analyzed" 
                            className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                          />
                        )}
                        <p className="text-gray-600 mb-2">Detected animal:</p>
                        <p className="text-3xl font-bold text-green-700 capitalize">
                          {result}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {!loading && !error && !result && (
                    <div className="text-center">
                      <Camera size={48} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Upload an image to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Camera className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">Advanced machine learning model trained on thousands of animal images</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">High Accuracy</h3>
              <p className="text-gray-600 text-sm">Accurately identifies various animal species with high confidence</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="text-purple-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Easy to Use</h3>
              <p className="text-gray-600 text-sm">Simple drag-and-drop interface for quick animal identification</p>
            </div>
          </div>
          
          {/* Vercel Optimization Notice */}
          <div className="mt-8 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-indigo-800">Deploying on Vercel?</h3>
                <div className="mt-2 text-sm text-indigo-700">
                  <p>
                    If you're experiencing deployment issues on Vercel, try our optimized version that's compatible with serverless environments.
                  </p>
                  <p className="mt-2">
                    <a href="/vercel-optimized" className="font-medium text-indigo-900 underline">
                      Try Vercel-optimized version →
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
