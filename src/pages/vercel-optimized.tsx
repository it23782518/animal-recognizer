// pages/vercel-optimized.tsx
import { useState } from 'react';
import OptimizedPredictor from '../components/OptimizedPredictor';

export default function VercelOptimized() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Animal Recognizer
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Vercel-Optimized Version
          </p>
        </div>
        
        <OptimizedPredictor />
        
        <div className="mt-12 text-center">
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Standard Version
          </a>
        </div>
      </div>
    </div>
  );
}
