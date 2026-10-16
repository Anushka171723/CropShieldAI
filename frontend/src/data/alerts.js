import { daysFromNow } from './seedDates'

// FICTIONAL sample alerts. type: Weather | Crop health | Expert review | Follow-up
// severity: High | Medium | Low | Info. relatedReportId / relatedFollowUpId point at other sample records.
export const seedAlerts = [
  { id: 'al-301', type: 'Crop health', severity: 'High', title: 'Early blight hotspot near your farm', message: 'Several tomato reports about 3 km away show similar symptoms. Check your plants this week.', createdAt: daysFromNow(-0.1), read: false, relatedReportId: 'rpt-1012', relatedHotspotId: 'h-101' },
  { id: 'al-302', type: 'Weather', severity: 'Medium', title: 'High humidity expected over the next 3 days', message: 'Warm, humid conditions can favour fungal diseases on tomato, chilli and grapes.', createdAt: daysFromNow(-0.4), read: false },
  { id: 'al-303', type: 'Follow-up', severity: 'Info', title: 'Follow-up due soon: Cotton (rpt-1009)', message: 'Please record how the crop looks in 2 days.', createdAt: daysFromNow(-0.8), read: false, relatedReportId: 'rpt-1009', relatedFollowUpId: 'fu-501' },
  { id: 'al-304', type: 'Expert review', severity: 'Info', title: 'Expert corrected your chilli report', message: 'An agricultural expert reviewed rpt-1007 and updated the finding.', createdAt: daysFromNow(-1.5), read: true, relatedReportId: 'rpt-1007' },
  { id: 'al-305', type: 'Crop health', severity: 'Medium', title: 'Whitefly activity rising in cotton nearby', message: 'Reports of whitefly have increased in nearby fields this week.', createdAt: daysFromNow(-3), read: true, relatedHotspotId: 'h-104' },
  { id: 'al-306', type: 'Weather', severity: 'Low', title: 'Dry spell forecast for the weekend', message: 'Lower humidity is expected, which can reduce fungal pressure.', createdAt: daysFromNow(-4), read: true },
]
