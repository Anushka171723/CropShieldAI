// The only module farmer pages import data from. Today it forwards to the sample-data service; when the
// backend exists, point these exports at real API calls and the pages do not need to change.
export {
  createReport,
  getAdvisory,
  getAlertTypes,
  getDetection,
  getFarmerDashboard,
  getFarmerProfile,
  getFollowUp,
  getFollowUpsForReport,
  getHotspotFilterOptions,
  getHotspots,
  getReport,
  getReportCrops,
  getRiskAssessment,
  getWeather,
  listAlerts,
  listFollowUps,
  listReports,
  markAllAlertsRead,
  setAlertRead,
  submitFollowUpUpdate,
  updateFarmerProfile,
} from './mock/farmerMockService'

// True while every farmer screen is showing fictional sample data. Used to label screens honestly.
export const isDemoData = true
