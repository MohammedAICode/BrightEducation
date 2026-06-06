import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Landing_page/Home'
import Login from './pages/Landing_page/Login'
import ForgotPassword from './pages/Landing_page/ForgotPassword'
import AdminDashboardLayout from './layouts/DashboardLayout'
import UserDashboardLayout from './layouts/UserDashboardLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import { useAppSelector } from './store/hooks'
import { SystemSettingsProvider } from './contexts/SystemSettingsContext'
import FeeReceipt from './components/dashboard/FeeReceipt'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <SystemSettingsProvider>
              <DashboardRouter />
            </SystemSettingsProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/receipt"
        element={
          <ProtectedRoute>
            <FeeReceipt />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function DashboardRouter() {
  const user = useAppSelector((state) => state.auth.user);
  
  if (user?.role === 'ADMIN') {
    return <AdminDashboardLayout />;
  }
  
  return <UserDashboardLayout />;
}

export default App