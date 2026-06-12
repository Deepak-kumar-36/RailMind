import type { TrainRealData, StationData } from "./types";

export const STATIONS = {
  NDLS: { name: "New Delhi", code: "NDLS", lat: 28.6139, lng: 77.2090 },
  MMCT: { name: "Mumbai Central", code: "MMCT", lat: 18.9690, lng: 72.8193 },
  HWH: { name: "Howrah", code: "HWH", lat: 22.5823, lng: 88.3433 },
  MAS: { name: "Chennai Central", code: "MAS", lat: 13.0827, lng: 80.2707 },
  SBC: { name: "KSR Bengaluru", code: "SBC", lat: 12.9784, lng: 77.5693 },
  ADI: { name: "Ahmedabad", code: "ADI", lat: 23.0225, lng: 72.5714 },
  SC: { name: "Secunderabad", code: "SC", lat: 17.4330, lng: 78.5046 },
  PUNE: { name: "Pune Junction", code: "PUNE", lat: 18.5284, lng: 73.8739 },
  JP: { name: "Jaipur", code: "JP", lat: 26.9196, lng: 75.7880 },
  BPL: { name: "Bhopal", code: "BPL", lat: 23.2599, lng: 77.4126 },
  LKO: { name: "Lucknow", code: "LKO", lat: 26.8300, lng: 80.9160 },
  PNBE: { name: "Patna Junction", code: "PNBE", lat: 25.6041, lng: 85.1384 },
  CNB: { name: "Kanpur Central", code: "CNB", lat: 26.4499, lng: 80.3319 },
  NGP: { name: "Nagpur", code: "NGP", lat: 21.1458, lng: 79.0882 },
  BSB: { name: "Varanasi", code: "BSB", lat: 25.3176, lng: 82.9739 },
  GHY: { name: "Guwahati", code: "GHY", lat: 26.1806, lng: 91.7538 },
  BBS: { name: "Bhubaneswar", code: "BBS", lat: 20.2706, lng: 85.8334 },
  INDB: { name: "Indore", code: "INDB", lat: 22.7177, lng: 75.8718 },
  SUR: { name: "Solapur", code: "SUR", lat: 17.6775, lng: 75.9082 },
  VSKP: { name: "Visakhapatnam", code: "VSKP", lat: 17.7214, lng: 83.2981 },
  CBE: { name: "Coimbatore", code: "CBE", lat: 11.0016, lng: 76.9628 },
  ERS: { name: "Ernakulam", code: "ERS", lat: 9.9691, lng: 76.2802 },
  TVC: { name: "Trivandrum", code: "TVC", lat: 8.4870, lng: 76.9501 },
  CDG: { name: "Chandigarh", code: "CDG", lat: 30.7333, lng: 76.7794 },
  ASR: { name: "Amritsar", code: "ASR", lat: 31.6340, lng: 74.8723 },
  AGC: { name: "Agra Cantt", code: "AGC", lat: 27.1593, lng: 77.9950 },
  GWL: { name: "Gwalior", code: "GWL", lat: 26.2045, lng: 78.1633 },
  JHS: { name: "Jhansi", code: "JHS", lat: 25.4484, lng: 78.5685 },
  RTM: { name: "Ratlam", code: "RTM", lat: 26.3353, lng: 74.9653 },
  KOTA: { name: "Kota", code: "KOTA", lat: 25.1825, lng: 75.8391 }
};

type BaseStation = { name: string; code: string; lat: number; lng: number; };

function createRoute(stations: BaseStation[], currentIdx: number): StationData[] {
  return stations.map((st, i) => {
    let status: StationData["status"] = "upcoming";
    if (i < currentIdx) status = "passed";
    else if (i === currentIdx) status = "current";
    return {
      ...st,
      status,
      scheduledArrival: `${String((10 + i * 2) % 24).padStart(2, '0')}:00`
    };
  });
}

// 15 Real-world train simulations
export const MOCK_TRAIN_DATABASE: Record<string, TrainRealData> = {
  "12301": {
    trainNumber: "12301",
    trainName: "Howrah Rajdhani Express",
    runningStatus: "on-time",
    currentPosition: [STATIONS.BSB.lat, STATIONS.BSB.lng],
    route: createRoute([STATIONS.HWH, STATIONS.PNBE, STATIONS.BSB, STATIONS.CNB, STATIONS.NDLS], 2)
  },
  "12951": {
    trainNumber: "12951",
    trainName: "Mumbai Rajdhani Express",
    runningStatus: "delayed",
    currentPosition: [STATIONS.ADI.lat, STATIONS.ADI.lng],
    route: createRoute([STATIONS.MMCT, STATIONS.ADI, STATIONS.RTM, STATIONS.KOTA, STATIONS.NDLS], 1)
  },
  "22436": {
    trainNumber: "22436",
    trainName: "Varanasi Vande Bharat",
    runningStatus: "on-time",
    currentPosition: [STATIONS.CNB.lat, STATIONS.CNB.lng],
    route: createRoute([STATIONS.NDLS, STATIONS.CNB, STATIONS.BSB], 1)
  },
  "12004": {
    trainNumber: "12004",
    trainName: "Lucknow Shatabdi",
    runningStatus: "on-time",
    currentPosition: [STATIONS.AGC.lat, STATIONS.AGC.lng],
    route: createRoute([STATIONS.NDLS, STATIONS.AGC, STATIONS.CNB, STATIONS.LKO], 1)
  },
  "12269": {
    trainNumber: "12269",
    trainName: "Chennai Duronto",
    runningStatus: "on-time",
    currentPosition: [STATIONS.NGP.lat, STATIONS.NGP.lng],
    route: createRoute([STATIONS.MAS, STATIONS.SC, STATIONS.NGP, STATIONS.BPL, STATIONS.NDLS], 2)
  },
  "22691": {
    trainNumber: "22691",
    trainName: "Rajdhani Express (SBC)",
    runningStatus: "on-time",
    currentPosition: [STATIONS.SC.lat, STATIONS.SC.lng],
    route: createRoute([STATIONS.SBC, STATIONS.SC, STATIONS.NGP, STATIONS.BPL, STATIONS.NDLS], 1)
  },
  "12810": {
    trainNumber: "12810",
    trainName: "Howrah Mail",
    runningStatus: "delayed",
    currentPosition: [STATIONS.NGP.lat, STATIONS.NGP.lng],
    route: createRoute([STATIONS.MMCT, STATIONS.NGP, STATIONS.HWH], 1)
  },
  "12625": {
    trainNumber: "12625",
    trainName: "Kerala Express",
    runningStatus: "on-time",
    currentPosition: [STATIONS.CBE.lat, STATIONS.CBE.lng],
    route: createRoute([STATIONS.TVC, STATIONS.ERS, STATIONS.CBE, STATIONS.NDLS], 2)
  },
  "12137": {
    trainNumber: "12137",
    trainName: "Punjab Mail",
    runningStatus: "on-time",
    currentPosition: [STATIONS.BPL.lat, STATIONS.BPL.lng],
    route: createRoute([STATIONS.MMCT, STATIONS.BPL, STATIONS.JHS, STATIONS.NDLS, STATIONS.ASR], 1)
  },
  "12840": {
    trainNumber: "12840",
    trainName: "Chennai Mail",
    runningStatus: "on-time",
    currentPosition: [STATIONS.VSKP.lat, STATIONS.VSKP.lng],
    route: createRoute([STATIONS.HWH, STATIONS.BBS, STATIONS.VSKP, STATIONS.MAS], 2)
  },
  "12925": {
    trainNumber: "12925",
    trainName: "Paschim Express",
    runningStatus: "halted",
    currentPosition: [STATIONS.RTM.lat, STATIONS.RTM.lng],
    route: createRoute([STATIONS.MMCT, STATIONS.RTM, STATIONS.KOTA, STATIONS.CDG], 1)
  },
  "12505": {
    trainNumber: "12505",
    trainName: "North East Express",
    runningStatus: "on-time",
    currentPosition: [STATIONS.PNBE.lat, STATIONS.PNBE.lng],
    route: createRoute([STATIONS.GHY, STATIONS.PNBE, STATIONS.CNB, STATIONS.NDLS], 1)
  },
  "11019": {
    trainNumber: "11019",
    trainName: "Konark Express",
    runningStatus: "delayed",
    currentPosition: [STATIONS.SUR.lat, STATIONS.SUR.lng],
    route: createRoute([STATIONS.MMCT, STATIONS.PUNE, STATIONS.SUR, STATIONS.SC, STATIONS.BBS], 2)
  },
  "12981": {
    trainNumber: "12981",
    trainName: "Chetak Express",
    runningStatus: "on-time",
    currentPosition: [STATIONS.JP.lat, STATIONS.JP.lng],
    route: createRoute([STATIONS.NDLS, STATIONS.JP, STATIONS.INDB], 1)
  },
  "12213": {
    trainNumber: "12213",
    trainName: "Duronto Express (YPR)",
    runningStatus: "on-time",
    currentPosition: [STATIONS.BPL.lat, STATIONS.BPL.lng],
    route: createRoute([STATIONS.SBC, STATIONS.SC, STATIONS.BPL, STATIONS.NDLS], 2)
  }
};

export const MOCK_TRAIN_LIST = Object.values(MOCK_TRAIN_DATABASE);
