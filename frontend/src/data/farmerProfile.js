// FICTIONAL sample farmer, used only for the frontend demo.
export const farmerProfile = {
  name: 'Ramesh Patil',
  phone: '98765 43210',
  email: 'farmer@demo.test',
  village: 'Dindori',
  district: 'Nashik',
  state: 'Maharashtra',
  farm: { name: 'Patil farm, Dindori', lat: 19.9975, lng: 73.7898, areaAcres: 6 },
  crops: ['Tomato', 'Cotton', 'Chilli', 'Onion'],
  language: 'en',
  // UI-only demo preferences: no real notification channel is wired up to any of these.
  notifications: {
    weatherAlerts: true,
    hotspotAlerts: true,
    expertReviewUpdates: true,
    followUpReminders: true,
  },
}
