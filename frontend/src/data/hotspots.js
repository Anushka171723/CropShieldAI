import { daysFromNow } from './seedDates'

// ILLUSTRATIVE hotspots around the sample farm. These are made up and are NOT real outbreaks.
// type: Disease | Pest. radiusM is the size of the zone drawn on the map.
export const seedHotspots = [
  { id: 'h-101', type: 'Disease', name: 'Early blight', crop: 'Tomato', lat: 20.0102, lng: 73.8121, radiusM: 1800, cases: 7, riskLevel: 'High', lastReportedAt: daysFromNow(-0.3) },
  { id: 'h-102', type: 'Pest', name: 'Aphids', crop: 'Chilli', lat: 19.965, lng: 73.76, radiusM: 1400, cases: 4, riskLevel: 'Medium', lastReportedAt: daysFromNow(-1) },
  { id: 'h-103', type: 'Disease', name: 'Powdery mildew', crop: 'Onion', lat: 20.045, lng: 73.74, radiusM: 1100, cases: 3, riskLevel: 'Low', lastReportedAt: daysFromNow(-4) },
  { id: 'h-104', type: 'Pest', name: 'Whitefly', crop: 'Cotton', lat: 19.93, lng: 73.84, radiusM: 1700, cases: 6, riskLevel: 'High', lastReportedAt: daysFromNow(-1.5) },
  { id: 'h-105', type: 'Disease', name: 'Downy mildew', crop: 'Grapes', lat: 20.08, lng: 73.83, radiusM: 1500, cases: 5, riskLevel: 'Medium', lastReportedAt: daysFromNow(-2) },
  { id: 'h-106', type: 'Disease', name: 'Leaf rust', crop: 'Wheat', lat: 19.86, lng: 73.7, radiusM: 1200, cases: 2, riskLevel: 'Low', lastReportedAt: daysFromNow(-6) },
]
