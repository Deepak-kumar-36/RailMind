import { MOCK_TRAIN_LIST } from "@railmind/shared";
import type { 
  IncidentType, 
  TrainRealData, 
  ImpactAnalysis, 
  DriverNotification, 
  PassengerMetrics, 
  NetworkStatus,
  WhyThisTrain,
  RiskLevel
} from "@railmind/shared";

// Utility: Calculate distance between two coordinates in km (Haversine formula)
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

export type CalculatedImpactData = {
  impactAnalysis: ImpactAnalysis;
  driverNotifications: DriverNotification[];
  passengerMetrics: PassengerMetrics;
  network: NetworkStatus;
};

export function calculateImpact(incidentType: IncidentType, targetTrain: TrainRealData): CalculatedImpactData {
  const [incLat, incLng] = targetTrain.currentPosition;
  
  // Define impact radius based on incident type
  let radiusKm = 50;
  let riskLevel: RiskLevel = "elevated";
  if (incidentType === "derailment") { radiusKm = 120; riskLevel = "critical"; }
  else if (incidentType === "flood") { radiusKm = 140; riskLevel = "elevated"; }
  else if (incidentType === "security-threat") { radiusKm = 100; riskLevel = "critical"; }
  else if (incidentType === "signal-failure") { radiusKm = 90; riskLevel = "elevated"; }

  const nearbyTrains: string[] = [];
  const incomingTrains: string[] = [];
  const outgoingTrains: string[] = [];
  const whyTheseTrains: WhyThisTrain[] = [];
  const driverNotifications: DriverNotification[] = [];

  // Always notify the target train
  driverNotifications.push({
    trainNumber: targetTrain.trainNumber,
    priority: "High",
    status: "Delivered"
  });

  // Find affected trains
  MOCK_TRAIN_LIST.forEach(train => {
    if (train.trainNumber === targetTrain.trainNumber) return;

    const [tLat, tLng] = train.currentPosition;
    const distance = getDistanceInKm(incLat, incLng, tLat, tLng);

    if (distance <= radiusKm) {
      nearbyTrains.push(train.trainNumber);
      
      // Basic heuristic to guess if incoming or outgoing (in a real app, compare routes)
      const isIncoming = Math.random() > 0.5;
      if (isIncoming) incomingTrains.push(train.trainNumber);
      else outgoingTrains.push(train.trainNumber);

      const timeToEnter = Math.round((distance / 80) * 60); // Assuming 80km/h average speed
      
      let trainRisk: RiskLevel = "elevated";
      let priority: "High" | "Medium" | "Low" = "Medium";
      
      if (distance < radiusKm / 2) {
        trainRisk = "critical";
        priority = "High";
      }

      whyTheseTrains.push({
        trainNumber: train.trainNumber,
        distanceFromIncident: `${Math.round(distance)} km`,
        timeToEnterCorridor: `${timeToEnter} min`,
        riskLevel: trainRisk
      });

      driverNotifications.push({
        trainNumber: train.trainNumber,
        priority,
        status: priority === "High" ? "Acknowledged" : "Pending"
      });
    }
  });

  // Guarantee at least 2-3 nearby trains for demonstration purposes
  if (nearbyTrains.length < 2) {
    const numToGenerate = 3 - nearbyTrains.length;
    for (let i = 0; i < numToGenerate; i++) {
      const fakeNumber = `SIM-${Math.floor(1000 + Math.random() * 9000)}`;
      const distance = 8 + Math.random() * 30; // 8 to 38 km away
      
      nearbyTrains.push(fakeNumber);
      
      const isIncoming = Math.random() > 0.5;
      if (isIncoming) incomingTrains.push(fakeNumber);
      else outgoingTrains.push(fakeNumber);

      const timeToEnter = Math.round((distance / 80) * 60);
      const trainRisk: RiskLevel = distance < radiusKm / 2 ? "critical" : "elevated";
      const priority = trainRisk === "critical" ? "High" : "Medium";
      
      whyTheseTrains.push({
        trainNumber: fakeNumber,
        distanceFromIncident: `${Math.round(distance)} km`,
        timeToEnterCorridor: `${timeToEnter} min`,
        riskLevel: trainRisk
      });

      driverNotifications.push({
        trainNumber: fakeNumber,
        priority,
        status: priority === "High" ? "Acknowledged" : "Pending"
      });
    }
  }

  // Calculate Affected Stations
  const affectedStations = targetTrain.route
    .filter(st => {
      const dist = getDistanceInKm(incLat, incLng, st.lat, st.lng);
      return dist <= radiusKm;
    })
    .map(st => st.name);

  // Fallback if no stations in radius (just use current/upcoming)
  if (affectedStations.length === 0) {
    const current = targetTrain.route.find(r => r.status === 'current') || targetTrain.route[0];
    const upcoming = targetTrain.route.find(r => r.status === 'upcoming') || targetTrain.route[1] || current;
    affectedStations.push(current.name);
    if (current.name !== upcoming.name) affectedStations.push(upcoming.name);
  }

  // Calculate coordinates for map visualization
  const affectedCorridorCoordinates = targetTrain.route
    .filter(st => affectedStations.includes(st.name))
    .map(st => [st.lat, st.lng] as [number, number]);

  const impactAnalysis: ImpactAnalysis = {
    affectedSegment: `${affectedStations[0]} - ${affectedStations[affectedStations.length - 1]}`,
    impactRadius: `${radiusKm}km`,
    affectedStations,
    nearbyTrains,
    incomingTrains,
    outgoingTrains,
    riskLevel,
    incidentCoordinates: targetTrain.currentPosition,
    affectedCorridorCoordinates,
    whyTheseTrains
  };

  const totalAffectedTrains = nearbyTrains.length + 1; // +1 for target train
  const passengersImpacted = totalAffectedTrains * 850; // Roughly 850 passengers per train
  
  const passengerMetrics: PassengerMetrics = {
    affectedTrains: totalAffectedTrains,
    affectedStations: affectedStations.length,
    passengersImpacted,
    estimatedDelay: riskLevel === "critical" ? "3h 30m" : "1h 45m",
    recoveryEta: riskLevel === "critical" ? "4h 00m" : "2h 30m"
  };

  // Base network health goes down based on affected trains and severity
  const healthDrop = (totalAffectedTrains * 2) + (riskLevel === "critical" ? 15 : 5);
  const networkHealth = Math.max(0, 94 - healthDrop); // Starting at 94% normal

  const network: NetworkStatus = {
    networkHealth,
    activeIncidents: 1,
    trainsAffected: totalAffectedTrains,
    trainsHalted: riskLevel === "critical" ? incomingTrains.length + 1 : 1,
    trainsRerouted: outgoingTrains.length,
    resourcesDeployed: totalAffectedTrains * 2 + 5,
    passengersImpacted,
    recoveryEta: passengerMetrics.recoveryEta
  };

  return {
    impactAnalysis,
    driverNotifications,
    passengerMetrics,
    network
  };
}
