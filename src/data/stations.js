import { NATIONWIDE_STATIONS, REGIONS } from './thailandStations.js';

export { NATIONWIDE_STATIONS, REGIONS };

export const ROUTES = REGIONS;

export const ALL_STATIONS = {
  all: NATIONWIDE_STATIONS,
  bkk: NATIONWIDE_STATIONS.filter(s => s.region === 'bkk'),
  south: NATIONWIDE_STATIONS.filter(s => s.region === 'south'),
  north: NATIONWIDE_STATIONS.filter(s => s.region === 'north'),
  northeast: NATIONWIDE_STATIONS.filter(s => s.region === 'northeast'),
  east: NATIONWIDE_STATIONS.filter(s => s.region === 'east'),
  west: NATIONWIDE_STATIONS.filter(s => s.region === 'west')
};

export const ALL_STATIONS_FLAT = NATIONWIDE_STATIONS;

export const INITIAL_STATIONS = NATIONWIDE_STATIONS;

export const MY_CAR_DATA = {
  model: "JAECOO 5 EV Ultra",
  batterySizeKwh: 67.0,
  batteryCurrentPct: 48,
  estimatedRangeKm: 205,
  maxChargeSpeedKw: 130,
  connectorType: "CCS2 / Type 2",
  v2lSupport: "3.3 kW",
  maxRangeFullKm: 426
};
