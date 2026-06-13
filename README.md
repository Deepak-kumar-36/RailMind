# RailMind 🚆🚨

**RailMind** is an AI-powered railway emergency intelligence platform built to manage, analyze, and mitigate train incidents in real-time. Designed for speed, scale, and high-stakes environments, it utilizes a custom AI Agent architecture powered by **Llama 3.1** to process emergencies in under 400 milliseconds.

This project was built for an international hackathon.

## 🌟 Core Features

- **Blazing Fast AI Agent**: Moved away from slow traditional LLM APIs. We use an OpenAI-compatible agent running **Llama 3.1** on **Groq LPUs** for instant operational recommendations and predictive forecasting.
- **Weather-Aware Safety**: Integrates with OpenWeatherMap to dynamically adjust disaster response plans based on live weather (e.g., fog, heavy rain) near the incident zone.
- **Multi-Language Emergency Alerts**: Automatically detects the regional language based on the train's GPS coordinates and translates emergency driver alerts into English, Hindi, and the local regional script instantly.
- **Hybrid Live Telemetry**: Uses **RapidAPI (IRCTC)** for live train data. Features an intelligent **API Key Rotation** system (retries on `429 Too Many Requests`) with a seamless fallback to a local mock database so the app *never* crashes during a demo.
- **Railway Digital Twin**: A real-time Leaflet map with Socket.IO telemetry showing active trains, stations, and dynamic blast radius visualizations.
- **PDF Report Generation**: Instant post-incident reports generated via PDFKit for compliance and review.
- **Neon Serverless PostgreSQL**: Stores persistent timeline events, agent decisions, and incident logs.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Leaflet Maps
- **Backend**: Node.js, Express, Socket.IO
- **Database**: Neon Serverless PostgreSQL
- **AI/LLM**: Groq API (Llama 3.1 8B), OpenAI SDK
- **External APIs**: RapidAPI (Live Trains), OpenWeatherMap

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the `backend` folder with the following variables:
   ```env
   # Database
   DATABASE_URL=postgresql://user:pass@host/db

   # AI Integration
   GROQ_API_KEY=gsk_your_groq_key_here
   
   # Live Data (RapidAPI supports comma-separated keys for auto-rotation!)
   RAPIDAPI_KEY=key_1,key_2,key_3
   
   # Weather
   OPENWEATHER_API_KEY=your_weather_key
   
   # Network
   PORT=4000
   FRONTEND_ORIGIN=http://localhost:3000
   ```

3. **Run the Application**
   ```bash
   npm run dev
   ```
   * The Frontend will run on `http://localhost:3000`
   * The Backend API will run on `http://localhost:4000`

## 💡 Fallback Philosophy

RailMind is built to be demo-proof. If any external API (Groq, RapidAPI, OpenWeather) fails, timeouts, or runs out of free-tier quota, the system instantly catches the error and falls back to a deterministic, high-quality local mock system. Your operations dashboard will never go down.
