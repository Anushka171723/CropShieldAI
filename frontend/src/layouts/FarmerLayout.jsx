import { Outlet } from 'react-router-dom'
import FarmerNavbar from '../components/farmer/FarmerNavbar'

// Frame for every /farmer/* screen: top navigation, then the page. Pages supply their own PageContainer.
export default function FarmerLayout() {
  return (
    <div className="min-h-screen bg-page">
      <FarmerNavbar />
      <Outlet />
    </div>
  )
}
