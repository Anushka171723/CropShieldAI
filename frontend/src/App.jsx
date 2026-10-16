import { Navigate, Route, Routes } from 'react-router-dom'
import ComingSoon from './components/ComingSoon'
import AppLayout from './layouts/AppLayout'
import FarmerLayout from './layouts/FarmerLayout'
import ForgotPassword from './pages/auth/ForgotPassword'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import NotFound from './pages/errors/NotFound'
import Alerts from './pages/farmer/Alerts'
import CropAdvisory from './pages/farmer/CropAdvisory'
import FarmerDashboard from './pages/farmer/Dashboard'
import DetectionResult from './pages/farmer/DetectionResult'
import FollowUpDetails from './pages/farmer/FollowUpDetails'
import FollowUps from './pages/farmer/FollowUps'
import MyReports from './pages/farmer/MyReports'
import NearbyHotspots from './pages/farmer/NearbyHotspots'
import NewReport from './pages/farmer/NewReport'
import Profile from './pages/farmer/Profile'
import ReportDetails from './pages/farmer/ReportDetails'
import RiskAssessment from './pages/farmer/RiskAssessment'
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
        {/* Farmer area uses its own layout (top nav + sample weather chip) */}
        <Route element={<RoleProtectedRoute roles={[ROLES.FARMER]} />}>
          <Route element={<FarmerLayout />}>
            <Route path="/farmer">
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<FarmerDashboard />} />
              <Route path="new-report" element={<NewReport />} />
              <Route path="reports" element={<MyReports />} />
              <Route path="reports/:id" element={<ReportDetails />} />
              <Route path="reports/:id/detection" element={<DetectionResult />} />
              <Route path="reports/:id/risk" element={<RiskAssessment />} />
              <Route path="reports/:id/advisory" element={<CropAdvisory />} />
              <Route path="hotspots" element={<NearbyHotspots />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="follow-ups" element={<FollowUps />} />
              <Route path="follow-ups/:id" element={<FollowUpDetails />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
        </Route>

        <Route element={<AppLayout />}>
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
