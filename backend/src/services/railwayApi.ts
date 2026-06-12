import type { TrainRealData } from "@railmind/shared";
import { MOCK_TRAIN_DATABASE, STATIONS } from "@railmind/shared";

/**
 * Simulates fetching data from the RailRadar API or Indian Rail API.
 * Includes a small delay to feel authentic.
 */
export async function fetchSimulatedTrainData(trainNumber: string): Promise<TrainRealData> {
  // Simulate network delay
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
