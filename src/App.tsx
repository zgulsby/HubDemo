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

function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
      setError('Request cancelled by user.');
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;

    // Check environment variables
    if (!process.env.REACT_APP_RUNPOD_API_KEY || !process.env.REACT_APP_RUNPOD_ENDPOINT_ID) {
      setError('Missing environment variables. Please check your .env file.');
      return;
    }

    // Create new abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Step 1: Submit the job
      const submitUrl = `https://api.runpod.ai/v2/${process.env.REACT_APP_RUNPOD_ENDPOINT_ID}/run`;
      console.log('Submitting job to URL:', submitUrl);
      console.log('Using API Key:', process.env.REACT_APP_RUNPOD_API_KEY?.substring(0, 10) + '...');
      
      const submitResponse = await axios.post(
        submitUrl,
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
          },
          signal: controller.signal
        }
      );

      const jobId = submitResponse.data.id;
      if (!jobId) {
        setError('Failed to submit job.');
        setLoading(false);
        setAbortController(null);
        return;
      }

      console.log('Job submitted successfully. Job ID:', jobId);

      // Step 2: Poll for status
      let status = submitResponse.data.status;
      let output = null;
      let pollCount = 0;
      while (status !== 'COMPLETED' && status !== 'FAILED' && pollCount < 60) {
        await new Promise(res => setTimeout(res, 2000)); // wait 2 seconds
        pollCount++;
        try {
          console.log(`Polling attempt ${pollCount} for job ${jobId}`);
          const statusResponse = await axios.get(
            `https://api.runpod.ai/v2/${process.env.REACT_APP_RUNPOD_ENDPOINT_ID}/status/${jobId}`,
            {
              headers: {
                'Authorization': `Bearer ${process.env.REACT_APP_RUNPOD_API_KEY}`,
              },
              signal: controller.signal
            }
          );
          status = statusResponse.data.status;
          output = statusResponse.data.output;
          console.log(`Status: ${status}`);
        } catch (pollErr) {
          // Check if it was cancelled
          if (controller.signal.aborted) {
            return; // Exit quietly if cancelled
          }
          console.error('Polling error:', pollErr);
          const errorMessage = pollErr instanceof Error ? pollErr.message : 
            (pollErr as any)?.response?.data?.error || 'Unknown polling error';
          setError(`Error polling job status: ${errorMessage}`);
          setLoading(false);
          setAbortController(null);
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
      // Check if it was cancelled
      if (controller.signal.aborted) {
        return; // Exit quietly if cancelled
      }
      console.error('Generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 
        (err as any)?.response?.data?.error || 'Unknown error';
      
      // Special handling for 404 errors
      if ((err as any)?.response?.status === 404) {
        setError(`Endpoint not found (404). Please verify your REACT_APP_RUNPOD_ENDPOINT_ID in the .env file. Check your RunPod dashboard for the correct endpoint ID.`);
      } else {
        setError(`Error generating image: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
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
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={loading || !prompt}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Image'}
            </Button>
            
            {loading && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleCancel}
                sx={{ minWidth: '120px' }}
              >
                Cancel
              </Button>
            )}
          </Box>
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