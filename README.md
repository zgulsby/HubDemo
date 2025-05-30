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

4. Add your RunPod API key to the `.env` file:
```
REACT_APP_RUNPOD_API_KEY=your_actual_runpod_api_key
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

- `REACT_APP_RUNPOD_API_KEY` - Your RunPod API key for Automatic1111 endpoint 