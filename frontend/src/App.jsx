import { Navigate, Route, Routes } from 'react-router-dom'
import ComingSoon from './components/ComingSoon'
import AppLayout from './layouts/AppLayout'
import ForgotPassword from './pages/auth/ForgotPassword'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import NotFound from './pages/errors/NotFound'
import FarmerDashboard from './pages/farmer/Dashboard'
import NewReport from './pages/farmer/NewReport'
import LegalPage from './pages/public/LegalPage'
import Landing from './pages/public/Landing'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import RoleProtectedRoute from './routes/RoleProtectedRoute'
import { ROLES } from './utils/roles'

// Placeholder screens: each is a route today so navigation works; the real page replaces its element later.
const soon = (title, description) => <ComingSoon title={title} description={description} />

export default function App() {
  return (
    <Routes>
      {/* Open to everyone */}
      <Route path="/" element={<Landing />} />
      <Route path="/terms" element={<LegalPage title="Terms of Use" />} />
      <Route path="/privacy" element={<LegalPage title="Privacy Policy" />} />

      {/* Signed-in users are redirected away from these to their own dashboard */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Everything below needs a session, then the right role */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<RoleProtectedRoute roles={[ROLES.FARMER]} />}>
            <Route path="/farmer">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<FarmerDashboard />} />
              <Route path="reports/new" element={<NewReport />} />
              <Route path="reports" element={soon('My Reports', 'Every report you have submitted, with its status.')} />
              <Route path="reports/:id" element={soon('Detection Result', 'The AI findings, risk and advisory for one report.')} />
              <Route path="risk" element={soon('Risk Assessment', 'Weather-based risk for your crops and location.')} />
              <Route path="advisory" element={soon('Advisory', 'Guidance and preventive measures in English, Hindi or Marathi.')} />
              <Route path="hotspots" element={soon('Nearby Hotspots', 'Disease and pest activity around your farm on a map.')} />
              <Route path="alerts" element={soon('Alerts', 'High-risk and hotspot alerts for your area.')} />
              <Route path="follow-ups" element={soon('Follow-ups', 'Track each case until it is resolved.')} />
              <Route path="profile" element={soon('Profile', 'Your account details and preferences.')} />
            </Route>
          </Route>

          <Route element={<RoleProtectedRoute roles={[ROLES.EXPERT]} />}>
            <Route path="/expert">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={soon('Expert Dashboard', 'Your review workload and recent validations.')} />
              <Route path="pending" element={soon('Pending Reports', 'Reports waiting for your review.')} />
              <Route path="history" element={soon('Review History', 'Reports you have confirmed, rejected or corrected.')} />
              <Route path="profile" element={soon('Profile', 'Your account details.')} />
            </Route>
          </Route>

          <Route element={<RoleProtectedRoute roles={[ROLES.OFFICER]} />}>
            <Route path="/officer">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={soon('Officer Dashboard', 'Regional statistics, charts and active hotspots.')} />
              <Route path="cases" element={soon('All Cases', 'Every reported case in your region.')} />
              <Route path="hotspots" element={soon('Hotspot Map', 'Disease and pest hotspots across the region.')} />
              <Route path="alerts" element={soon('Alerts & Interventions', 'Active alerts and the interventions planned for them.')} />
              <Route path="follow-ups" element={soon('Follow-up Monitoring', 'Progress of cases through to resolution.')} />
              <Route path="profile" element={soon('Profile', 'Your account details.')} />
            </Route>
          </Route>

          <Route element={<RoleProtectedRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/admin">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={soon('Admin Dashboard', 'An overview of users, approvals and system health.')} />
              <Route path="users" element={soon('User Management', 'View and manage user accounts.')} />
              <Route path="approvals" element={soon('Expert/Officer Approvals', 'Approve or create expert and officer accounts.')} />
              <Route path="system" element={soon('System Overview', 'Service status and usage.')} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
