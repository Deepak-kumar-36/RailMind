import type { TrainRealData, StationData } from "@railmind/shared";
import { MOCK_TRAIN_DATABASE } from "@railmind/shared";
import { env } from "../config/env";

/**
 * Fetches real train data from RapidAPI IRCTC.
 * Falls back to MOCK_TRAIN_DATABASE if train is not found or API fails.
 */
export async function fetchSimulatedTrainData(trainNumber: string): Promise<TrainRealData> {
  if (env.rapidApiKeys && env.rapidApiKeys.length > 0) {
    let success = false;
    
    for (let i = 0; i < env.rapidApiKeys.length; i++) {
      const apiKey = env.rapidApiKeys[i];
      try {
        console.log(`[RailwayAPI] Fetching real data for train ${trainNumber} using API Key #${i + 1}...`);
        const response = await fetch(`https://irctc1.p.rapidapi.com/api/v1/getTrainSchedule?trainNo=${trainNumber}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'irctc1.p.rapidapi.com'
          }
        });

        if (response.ok) {
          const json = (await response.json()) as any;
          
          if (json.status && json.data && json.data.route && json.data.route.length > 0) {
            console.log(`[RailwayAPI] ✅ Success! Loaded real route for ${json.data.train_name}`);
          
          // Map RapidAPI route to StationData with sta_min for calculation
          const mappedRoute = json.data.route
            .filter((st: any) => st.stop)
            .map((st: any) => {
              const sta_min = parseInt(st.sta_min || "0");
              return {
                name: st.station_name,
                code: st.station_code,
                lat: parseFloat(st.lat || "0"),
                lng: parseFloat(st.lng || "0"),
                sta_min,
                status: "upcoming" as "passed" | "current" | "upcoming",
                scheduledArrival: `${String(Math.floor(sta_min / 60) % 24).padStart(2, '0')}:${String(sta_min % 60).padStart(2, '0')}`
              };
            });

          const now = new Date();
          const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
          let currentMinutesOfDay = istTime.getUTCHours() * 60 + istTime.getUTCMinutes();
          
          // Rough heuristic for overnight trains
          if (mappedRoute.length > 0 && currentMinutesOfDay < mappedRoute[0].sta_min && mappedRoute[mappedRoute.length-1].sta_min > 1440) {
             currentMinutesOfDay += 1440; 
          }

          let currentPosition: [number, number] = mappedRoute.length > 0 ? [mappedRoute[0].lat, mappedRoute[0].lng] : [22.9734, 78.6569];
          
          for (let i = 0; i < mappedRoute.length; i++) {
             if (mappedRoute[i].sta_min <= currentMinutesOfDay) {
                 mappedRoute[i].status = "passed";
                 currentPosition = [mappedRoute[i].lat, mappedRoute[i].lng];
             } else {
                 if (i > 0 && mappedRoute[i-1].status === "passed") {
                     mappedRoute[i-1].status = "current";
                     const prev = mappedRoute[i-1];
                     const next = mappedRoute[i];
                     const timeDiff = next.sta_min - prev.sta_min;
                     const timeElapsed = currentMinutesOfDay - prev.sta_min;
                     const progress = timeDiff > 0 ? timeElapsed / timeDiff : 0;
                     currentPosition = [
                        prev.lat + (next.lat - prev.lat) * progress,
                        prev.lng + (next.lng - prev.lng) * progress
                     ];
                 }
                 break;
             }
          }
          
          if (mappedRoute.length > 0 && mappedRoute[mappedRoute.length - 1].status === "passed") {
             mappedRoute[mappedRoute.length - 1].status = "current";
          }
          
          if (currentPosition[0] === 0 || isNaN(currentPosition[0])) {
             currentPosition = [22.9734, 78.6569];
          }

          const realRoute: StationData[] = mappedRoute.map(({ sta_min, ...rest }: any) => rest);

            return {
              trainNumber: json.data.train_number || trainNumber,
              trainName: json.data.train_name,
              runningStatus: "on-time",
              currentPosition,
              route: realRoute
            };
          } else {
            console.warn(`[RailwayAPI] Train ${trainNumber} not found in live API.`);
          }
        } else if (response.status === 429) {
          console.warn(`[RailwayAPI] API Key #${i + 1} exhausted (429). Rotating to next key...`);
          continue; // Try next key
        } else {
          console.warn(`[RailwayAPI] API returned status ${response.status}. Rotating to next key if available...`);
        }
      } catch (err) {
        console.error(`[RailwayAPI] Network error using key #${i + 1}:`, err);
      }
    }
    
    console.warn(`[RailwayAPI] All RapidAPI keys exhausted or failed. Falling back to mock data.`);
  } else {
    console.warn(`[RailwayAPI] No RAPIDAPI_KEY provided. Falling back to mock data.`);
  }

  // Simulate network delay for fallback
  await new Promise(resolve => setTimeout(resolve, 800));

  const train = MOCK_TRAIN_DATABASE[trainNumber];
  if (train) {
    return train;
  }

  // Generic fallback if unknown train is searched
  return {
    trainNumber,
    trainName: `Express ${trainNumber}`,
    runningStatus: "on-time",
    currentPosition: [22.9734, 78.6569], // Center India
    route: [
      { name: "Origin", code: "ORG", lat: 20.0, lng: 75.0, status: "passed", scheduledArrival: "10:00" },
      { name: "Current Point", code: "CUR", lat: 22.9734, lng: 78.6569, status: "current", scheduledArrival: "15:00" },
      { name: "Destination", code: "DST", lat: 25.0, lng: 80.0, status: "upcoming", scheduledArrival: "20:00" }
    ]
  };
}
