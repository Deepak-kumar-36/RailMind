import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
import type { DriverNotification } from "@railmind/shared";

export type TranslatedNotifications = {
  en: DriverNotificationWithMessage[];
  hi: DriverNotificationWithMessage[];
  regional: DriverNotificationWithMessage[];
  regionalLanguage: string; // e.g., "Tamil", "Bengali"
};

export type DriverNotificationWithMessage = DriverNotification & {
  message: string;
};

// Determine regional language based on geographic coordinates
function getRegionalLanguage(lat: number, lng: number): string {
  // South India
  if (lat < 15 && lng > 76 && lng < 81) return "Tamil";
  if (lat < 15 && lng < 76) return "Kannada";
  if (lat < 12 && lng < 77) return "Malayalam";
  if (lat < 20 && lat > 15 && lng > 78) return "Telugu";
  // East India
  if (lat > 20 && lat < 27 && lng > 85) return "Bengali";
  if (lat < 22 && lng > 83 && lng < 87) return "Odia";
  // West India
  if (lat < 22 && lng < 75) return "Marathi";
  if (lat > 20 && lat < 25 && lng < 73) return "Gujarati";
  // North India
  if (lat > 25 && lng > 74 && lng < 78) return "Rajasthani";
  if (lat > 30) return "Punjabi";
  // Default
  return "Hindi";
}

export async function translateNotifications(
  notifications: DriverNotification[],
  incidentType: string,
  trainPosition: [number, number]
): Promise<TranslatedNotifications> {
  const regionalLanguage = getRegionalLanguage(trainPosition[0], trainPosition[1]);

  // Build English messages first
  const enNotifications: DriverNotificationWithMessage[] = notifications.map(n => ({
    ...n,
    message: n.priority === "High"
      ? `EMERGENCY: ${incidentType.toUpperCase()} ahead. Halt train ${n.trainNumber} immediately. Await further instructions from Control.`
      : `ALERT: ${incidentType.toUpperCase()} reported on corridor. Reduce speed to 30 km/h. Monitor radio for updates.`
  }));

  if (!env.geminiApiKey) {
    // No AI available — return English only
    return {
      en: enNotifications,
      hi: enNotifications.map(n => ({ ...n, message: `[हिन्दी] ${n.message}` })),
      regional: enNotifications.map(n => ({ ...n, message: `[${regionalLanguage}] ${n.message}` })),
      regionalLanguage
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
    const messages = enNotifications.map(n => n.message);

    const prompt = `You are a railway emergency communication translator.
Translate each of the following emergency railway notifications into TWO languages:
1. Hindi (Devanagari script)
2. ${regionalLanguage} (native script)

Input messages:
${messages.map((m, i) => `${i + 1}. ${m}`).join("\n")}

Return ONLY a valid JSON object (no markdown):
{
  "hi": ["hindi translation 1", "hindi translation 2", ...],
  "regional": ["${regionalLanguage} translation 1", "${regionalLanguage} translation 2", ...]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text || "";
    const parsed = JSON.parse(text) as { hi: string[]; regional: string[] };

    console.log(`[Translator] ✅ Translated ${messages.length} alerts to Hindi + ${regionalLanguage}`);

    return {
      en: enNotifications,
      hi: enNotifications.map((n, i) => ({
        ...n,
        message: parsed.hi[i] || n.message
      })),
      regional: enNotifications.map((n, i) => ({
        ...n,
        message: parsed.regional[i] || n.message
      })),
      regionalLanguage
    };
  } catch (error) {
    console.error("[Translator] Translation failed, returning English:", error);
    return {
      en: enNotifications,
      hi: enNotifications.map(n => ({ ...n, message: `[हिन्दी] ${n.message}` })),
      regional: enNotifications.map(n => ({ ...n, message: `[${regionalLanguage}] ${n.message}` })),
      regionalLanguage
    };
  }
}
