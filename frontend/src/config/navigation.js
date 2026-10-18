// Top-navigation items for each role. Every `to` has a matching route in App.jsx.
// Without `end`, a link also stays highlighted on its child pages (e.g. My Reports on /farmer/reports/:id).
export const NAV_ITEMS = {
  FARMER: [
    { to: '/farmer/dashboard', label: 'Home' },
    { to: '/farmer/new-report', label: 'New Report' },
    { to: '/farmer/reports', label: 'My Reports' },
    { to: '/farmer/hotspots', label: 'Nearby Hotspots' },
    { to: '/farmer/alerts', label: 'Alerts' },
    { to: '/farmer/follow-ups', label: 'Follow-ups' },
    { to: '/farmer/profile', label: 'Profile' },
  ],
  EXPERT: [
    { to: '/expert/dashboard', label: 'Dashboard' },
    { to: '/expert/pending', label: 'Pending Reports' },
    { to: '/expert/history', label: 'Review History' },
    { to: '/expert/profile', label: 'Profile' },
  ],
  OFFICER: [
    { to: '/officer/dashboard', label: 'Dashboard' },
    { to: '/officer/cases', label: 'All Cases' },
    { to: '/officer/hotspots', label: 'Hotspot Map' },
    { to: '/officer/alerts', label: 'Alerts & Interventions' },
    { to: '/officer/follow-ups', label: 'Follow-up Monitoring' },
    { to: '/officer/profile', label: 'Profile' },
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'User Management' },
    { to: '/admin/approvals', label: 'Expert/Officer Approvals' },
    { to: '/admin/system', label: 'System Overview' },
  ],
}
