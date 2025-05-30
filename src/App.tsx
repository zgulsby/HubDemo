import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import axios from 'axios';

interface GenerationResponse {
  status: string;
  output: {
    images: string[];
  };
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Step 1: Submit the job
      const submitResponse = await axios.post(
        'https://api.runpod.ai/v2/go0d3c8wghbyy9/run',
        {
          input: {
            prompt: prompt,
            negative_prompt: "ugly, blurry, poor quality, distorted",
            num_inference_steps: 50,
            guidance_scale: 7.5,
            width: 512,
            height: 512,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_RUNPOD_API_KEY}`,
          }
        }
      );

      const jobId = submitResponse.data.id;
      if (!jobId) {
        setError('Failed to submit job.');
        setLoading(false);
        return;
      }

      // Step 2: Poll for status
      let status = submitResponse.data.status;
      let output = null;
      let pollCount = 0;
      while (status !== 'COMPLETED' && status !== 'FAILED' && pollCount < 60) {
        await new Promise(res => setTimeout(res, 2000)); // wait 2 seconds
        pollCount++;
        try {
          const statusResponse = await axios.get(
            `https://api.runpod.ai/v2/go0d3c8wghbyy9/status/${jobId}`,
            {
              headers: {
                'Authorization': `Bearer ${process.env.REACT_APP_RUNPOD_API_KEY}`,
              }
            }
          );
          status = statusResponse.data.status;
          output = statusResponse.data.output;
        } catch (pollErr) {
          setError('Error polling job status.');
          setLoading(false);
          return;
        }
      }

      if (status === 'COMPLETED' && output && output.images && output.images.length > 0) {
        // Convert base64 to data URL for display
        const base64Image = output.images[0];
        const imageDataUrl = `data:image/png;base64,${base64Image}`;
        setGeneratedImage(imageDataUrl);
      } else if (status === 'FAILED') {
        setError('Image generation failed.');
      } else {
        setError('Image generation timed out.');
      }
    } catch (err) {
      setError('Error generating image. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          AI Image Generator
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <TextField
            fullWidth
            label="Enter your prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
          
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading || !prompt}
            fullWidth
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Image'}
          </Button>
        </Paper>

        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {generatedImage && (
          <Paper elevation={3} sx={{ p: 2 }}>
            <img
              src={generatedImage}
              alt="Generated"
              style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
            />
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default App; 