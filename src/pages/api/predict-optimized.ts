// pages/api/predict-optimized.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Ensure we have a base64 image
    const { image } = req.body;
    if (!image || !image.startsWith('data:image')) {
      return res.status(400).json({ error: 'Valid base64 image data is required' });
    }

    // Call the Python script with the base64 image
    const pythonScript = path.join(process.cwd(), 'src', 'server', 'predict_optimized.py');
    
    // Use spawn to avoid command injection vulnerabilities
    const pythonProcess = spawn('python', [pythonScript, image]);
    
    let result = '';
    let errorOutput = '';

    // Collect data from stdout
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    // Collect errors from stderr
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    // Handle process completion
    return new Promise<void>((resolve) => {
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error(`Error output: ${errorOutput}`);
          res.status(500).json({ error: 'Prediction failed', details: errorOutput });
        } else {
          try {
            // Try to parse the result as JSON
            const parsedResult = JSON.parse(result.trim());
            res.status(200).json(parsedResult);
          } catch (e) {
            // If parsing fails, return the raw result
            res.status(200).json({ prediction: result.trim() });
          }
        }
        resolve();
      });
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
