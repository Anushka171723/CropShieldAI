import { Outlet } from 'react-router-dom'
import TopNavbar from '../components/nav/TopNavbar'

// Layout for the Expert, Officer and Admin areas (and the access-denied page). Farmers use FarmerLayout.
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f8faf7]">
      <TopNavbar />
      <Outlet />
    </div>
  )
}
