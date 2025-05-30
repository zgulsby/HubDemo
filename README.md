# AI Image Generator Demo

A simple React application that generates images using RunPod's Automatic1111 API.

## Features

- Simple text-to-image generation
- Material-UI interface
- Real-time status polling
- Base64 image display

## Setup

1. Clone the repository:
```bash
git clone https://github.com/zgulsby/HubDemo.git
cd HubDemo
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Configure your RunPod credentials in the `.env` file:

### Getting Your RunPod API Key:
- Go to [RunPod](https://runpod.io)
- Sign in to your account
- Navigate to Settings → API Keys
- Create a new API key or copy an existing one

### Getting Your RunPod Endpoint ID:
- In your RunPod dashboard, go to "Serverless" → "Endpoints"
- Find your Automatic1111 endpoint
- The Endpoint ID is the string in your endpoint URL after `/v2/` and before `/run`
- Example: if your endpoint URL is `https://api.runpod.ai/v2/abc123def456/run`, then your Endpoint ID is `abc123def456`

Update your `.env` file:
```
REACT_APP_RUNPOD_API_KEY=your_actual_api_key_here
REACT_APP_RUNPOD_ENDPOINT_ID=your_actual_endpoint_id_here
```

5. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Usage

1. Enter a text prompt describing the image you want to generate
2. Click "Generate Image"
3. Wait for the image to be generated and displayed

## Environment Variables

- `REACT_APP_RUNPOD_API_KEY` - Your RunPod API key
- `REACT_APP_RUNPOD_ENDPOINT_ID` - Your RunPod Automatic1111 endpoint ID

## Requirements

- RunPod account with an active Automatic1111 serverless endpoint
- Node.js 14+ and npm 