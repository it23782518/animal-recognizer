// pages/api/predict.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { exec } from 'child_process';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {  const form = new IncomingForm({ 
    uploadDir: './public/uploads', 
    keepExtensions: true,
    filter: (part) => {
      const isImage = part.mimetype?.includes('image') ?? false;
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
      const hasValidExtension = allowedExtensions.some(ext => 
        part.originalFilename?.toLowerCase().endsWith(ext) ?? false
      );
      return isImage && hasValidExtension;
    }
  });
  form.parse(req, async (err: Error | null, fields: Record<string, unknown>, files: Record<string, unknown>) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(400).json({ error: 'Failed to parse form data' });
    }

    if (!files.image) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    const imagePath = imageFile.filepath;    console.log('Image uploaded to:', imagePath);

    // Use 'python' instead of 'python3' for Windows, and provide full path to script
    const pythonScript = 'src/server/predict.py';
    const command = `python "${pythonScript}" "${imagePath}"`;
    
    console.log('Executing command:', command);
    
    exec(command, (err, stdout, stderr) => {
      console.log('Command completed');
      console.log('Error:', err);
      console.log('Stdout:', stdout);
      console.log('Stderr:', stderr);      if (err) {
        console.error('Python execution error:', err);
        console.error('stderr:', stderr);
        return res.status(500).json({ 
          error: 'Prediction failed', 
          details: `${stderr || err.message}. Command: ${command}` 
        });
      }

      console.log('Raw Python output:', stdout);
      
      // Clean the output - remove ANSI codes and extra whitespace
      let prediction = stdout
        .replace(/\[\d+m/g, '') // Remove ANSI color codes like [1m, [32m, etc.
        .replace(/\[0m/g, '')   // Remove ANSI reset codes
        .replace(/\[[0-9;]*m/g, '') // Remove any remaining ANSI codes
        .replace(/=+/g, '')     // Remove progress bar characters
        .replace(/\d+ms\/step/g, '') // Remove timing info
        .replace(/\d+\/\d+/g, '') // Remove progress fractions
        .replace(/\s+/g, ' ')   // Replace multiple spaces with single space
        .trim();                // Remove leading/trailing whitespace
      
      console.log('Cleaned prediction:', prediction);
      
      if (!prediction || prediction.startsWith('Error')) {
        return res.status(500).json({ 
          error: 'Prediction failed', 
          details: prediction || 'Unknown error' 
        });
      }

      res.status(200).json({ prediction });
    });
  });
}
