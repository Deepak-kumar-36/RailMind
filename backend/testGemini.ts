import { analyzeTrainIncidentWithGemini } from "./src/services/gemini";

async function test() {
  const trainData = {
    trainNumber: "12301",
    trainName: "Test Train",
    runningStatus: "on-time" as const,
    currentPosition: [0, 0] as [number, number],
    route: []
  };

  try {
    const res = await analyzeTrainIncidentWithGemini("derailment", trainData);
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
