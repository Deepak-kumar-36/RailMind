import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "*",
  databaseUrl: process.env.DATABASE_URL,
  groqApiKey: process.env.GROQ_API_KEY,
  rapidApiKeys: process.env.RAPIDAPI_KEY?.split(',').map(k => k.trim()).filter(k => k.length > 0) || [],
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY
};
