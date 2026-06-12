import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  rapidApiKey: process.env.RAPIDAPI_KEY,
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY
};
