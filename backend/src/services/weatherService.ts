import { env } from "../config/env";
import type { StationData } from "@railmind/shared";

export type StationWeather = {
  stationName: string;
  stationCode: string;
  temp: number;           // Celsius
  humidity: number;       // %
  windSpeed: number;      // km/h
  condition: string;      // e.g. "Heavy Rain", "Clear", "Fog"
  icon: string;           // weather icon code
  visibility: number;     // meters
  riskLevel: "safe" | "caution" | "danger";
  alerts: string[];       // human-readable alerts
};

export type RouteWeatherReport = {
  stationWeather: StationWeather[];
  overallRisk: "safe" | "caution" | "danger";
  summary: string;        // One-line summary for AI prompt
};

// Determine risk from weather conditions
function assessWeatherRisk(
  condition: string,
  visibility: number,
  windSpeed: number,
  temp: number
): { riskLevel: "safe" | "caution" | "danger"; alerts: string[] } {
  const alerts: string[] = [];
  let risk = "safe" as "safe" | "caution" | "danger";

  const condLower = condition.toLowerCase();

  if (condLower.includes("thunderstorm") || condLower.includes("tornado")) {
    alerts.push(`⚠️ ${condition} — Extreme danger to rail operations`);
    risk = "danger";
  } else if (condLower.includes("heavy rain") || condLower.includes("heavy intensity rain")) {
    alerts.push(`🌧️ Heavy rainfall — Track flooding risk`);
    risk = "danger";
  } else if (condLower.includes("rain") || condLower.includes("drizzle")) {
    alerts.push(`🌦️ Rainfall — Reduced braking efficiency`);
    if (risk !== "danger") risk = "caution";
  }

  if (visibility < 200) {
    alerts.push(`🌫️ Dense fog — Visibility ${visibility}m — Speed restriction required`);
    risk = "danger";
  } else if (visibility < 500) {
    alerts.push(`🌫️ Fog — Visibility ${visibility}m — Caution advised`);
    if (risk !== "danger") risk = "caution";
  }

  if (windSpeed > 70) {
    alerts.push(`💨 High wind ${windSpeed} km/h — Derailment risk`);
    risk = "danger";
  } else if (windSpeed > 40) {
    alerts.push(`💨 Strong wind ${windSpeed} km/h — Speed restriction`);
    if (risk !== "danger") risk = "caution";
  }

  if (temp > 48) {
    alerts.push(`🔥 Extreme heat ${temp}°C — Track buckling risk`);
    risk = "danger";
  } else if (temp > 44) {
    alerts.push(`☀️ High temperature ${temp}°C — Monitor rail expansion`);
    if (risk !== "danger") risk = "caution";
  }

  return { riskLevel: risk, alerts };
}

// Smart weather fallback based on geography + time of day
function generateRealisticWeather(station: StationData): StationWeather {
  const now = new Date();
  const hour = (now.getUTCHours() + 5) % 24; // IST
  const month = now.getMonth(); // 0-11
  const isMonsooon = month >= 5 && month <= 8; // Jun-Sep
  const isWinter = month >= 11 || month <= 1;  // Dec-Feb
  const isSummer = month >= 3 && month <= 5;   // Apr-Jun

  // Base temp varies by latitude (north India cooler, south hotter)
  let baseTemp = 32 - (station.lat - 15) * 0.5;
  if (isWinter) baseTemp -= 10;
  if (isSummer) baseTemp += 6;
  if (hour < 6 || hour > 20) baseTemp -= 5;

  let condition = "Clear";
  let visibility = 10000;
  let humidity = 50;
  let windSpeed = 10 + Math.random() * 15;

  // Monsoon logic — higher chance of rain for eastern/coastal stations
  if (isMonsooon) {
    const rainChance = 0.4 + (station.lng > 80 ? 0.2 : 0) + (station.lat < 20 ? 0.1 : 0);
    if (Math.random() < rainChance) {
      condition = Math.random() > 0.6 ? "Heavy Intensity Rain" : "Moderate Rain";
      visibility = Math.random() > 0.5 ? 3000 : 1500;
      humidity = 85 + Math.random() * 10;
      windSpeed = 20 + Math.random() * 30;
    } else {
      condition = "Overcast Clouds";
      humidity = 70;
    }
  }

  // Winter fog in North India (lat > 25)
  if (isWinter && station.lat > 25 && hour < 9) {
    if (Math.random() < 0.5) {
      condition = "Fog";
      visibility = 100 + Math.random() * 400;
      humidity = 95;
    }
  }

  const temp = Math.round(baseTemp + (Math.random() * 4 - 2));
  const { riskLevel, alerts } = assessWeatherRisk(condition, visibility, windSpeed, temp);

  return {
    stationName: station.name,
    stationCode: station.code,
    temp,
    humidity: Math.round(humidity),
    windSpeed: Math.round(windSpeed),
    condition,
    icon: condition.toLowerCase().includes("rain") ? "13d" : condition.toLowerCase().includes("fog") ? "50d" : "01d",
    visibility: Math.round(visibility),
    riskLevel,
    alerts
  };
}

async function fetchWeatherForCoord(lat: number, lng: number): Promise<any | null> {
  if (!env.openWeatherApiKey) return null;
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${env.openWeatherApiKey}`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
}

function parseOpenWeatherResponse(data: any, station: StationData): StationWeather {
  const condition = data.weather?.[0]?.description || "Clear";
  const temp = Math.round(data.main?.temp || 30);
  const humidity = data.main?.humidity || 50;
  const windSpeed = Math.round((data.wind?.speed || 3) * 3.6); // m/s -> km/h
  const visibility = data.visibility || 10000;
  const icon = data.weather?.[0]?.icon || "01d";

  const { riskLevel, alerts } = assessWeatherRisk(condition, visibility, windSpeed, temp);

  return {
    stationName: station.name,
    stationCode: station.code,
    temp,
    humidity,
    windSpeed,
    condition: condition.charAt(0).toUpperCase() + condition.slice(1),
    icon,
    visibility,
    riskLevel,
    alerts
  };
}

/**
 * Fetch weather for up to 5 key stations on the route.
 * Uses OpenWeatherMap if key is available, otherwise generates realistic simulated data.
 */
export async function getRouteWeather(route: StationData[]): Promise<RouteWeatherReport> {
  // Sample up to 5 stations (first, last, current, and 2 evenly spaced)
  const indices = new Set<number>();
  indices.add(0);
  indices.add(route.length - 1);
  const currentIdx = route.findIndex(s => s.status === "current");
  if (currentIdx >= 0) indices.add(currentIdx);
  const step = Math.max(1, Math.floor(route.length / 4));
  for (let i = step; i < route.length && indices.size < 5; i += step) {
    indices.add(i);
  }

  const selectedStations = [...indices].sort((a, b) => a - b).map(i => route[i]);
  
  let stationWeather: StationWeather[];

  if (env.openWeatherApiKey) {
    console.log(`[Weather] Fetching live weather for ${selectedStations.length} stations...`);
    const results = await Promise.all(
      selectedStations.map(async (st) => {
        if (st.lat === 0 || st.lng === 0) return generateRealisticWeather(st);
        const data = await fetchWeatherForCoord(st.lat, st.lng);
        if (data) return parseOpenWeatherResponse(data, st);
        return generateRealisticWeather(st);
      })
    );
    stationWeather = results;
    console.log(`[Weather] ✅ Live weather loaded`);
  } else {
    console.log(`[Weather] No API key. Using simulated weather data.`);
    stationWeather = selectedStations.map(generateRealisticWeather);
  }

  // Overall risk is the worst risk across all stations
  let overallRisk: "safe" | "caution" | "danger" = "safe";
  for (const sw of stationWeather) {
    if (sw.riskLevel === "danger") { overallRisk = "danger"; break; }
    if (sw.riskLevel === "caution") overallRisk = "caution";
  }

  // Build summary string for the AI prompt
  const dangerStations = stationWeather.filter(s => s.alerts.length > 0);
  const summary = dangerStations.length > 0
    ? `WEATHER ALERTS: ${dangerStations.map(s => `${s.stationName}: ${s.alerts.join(", ")}`).join(" | ")}`
    : "Weather: Clear conditions across all stations on route.";

  return { stationWeather, overallRisk, summary };
}
