import { Navigate, Outlet, Route, Routes } from 'react-router'
import { Toaster } from 'sonner'
import { AuthProvider, RequireAuth, RequireRole, useAuth, homeFor } from '@/lib/auth'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import RegisterAdmin from '@/pages/RegisterAdmin'
import AdminManagement from '@/pages/merchant/AdminManagement'
import MerchantDashboard from '@/pages/merchant/MerchantDashboard'
import ClerkManagement from '@/pages/admin/ClerkManagement'
import ClerkDashboard from '@/pages/ClerkDashboard'
import AdminDashboard from '@/pages/AdminDashboard'
import AdminReceivedStock from '@/pages/AdminReceivedStock'
import AdminUnpaidStock from '@/pages/AdminUnpaidStock'
import AdminSupplyRequests from '@/pages/AdminSupplyRequests'
import StockPage from '@/pages/StockPage'
import ReceiveStockPage from '@/pages/ReceiveStockPage'
import SpoilagePage from '@/pages/SpoilagePage'
import SupplyRequestPage from '@/pages/SupplyRequestPage'
import "./styles/main.css"

function RootRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? homeFor(user.role) : '/login'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/register" element={<RegisterAdmin />} />
        <Route path="/accept-invite" element={<RegisterAdmin />} />

        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route
            path="/merchant"
            element={
              <RequireRole roles={['merchant']}>
                <MerchantDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/merchant/admins"
            element={
              <RequireRole roles={['merchant']}>
                <AdminManagement />
              </RequireRole>
            }
          />
          <Route
            path="/admin/clerks"
            element={
              <RequireRole roles={['admin']}>
                <ClerkManagement />
              </RequireRole>
            }
          />
          <Route path="/clerk" element={<RequireRole roles={['clerk']}><ClerkDashboard /></RequireRole>} />
          <Route path="/clerk/stock" element={<RequireRole roles={['clerk']}><StockPage /></RequireRole>} />
          <Route path="/clerk/receive-stock" element={<RequireRole roles={['clerk']}><ReceiveStockPage /></RequireRole>} />
          <Route path="/clerk/spoilage" element={<RequireRole roles={['clerk']}><SpoilagePage /></RequireRole>} />
          <Route path="/clerk/supply-requests" element={<RequireRole roles={['clerk']}><SupplyRequestPage /></RequireRole>} />
          <Route path="/admin" element={<RequireRole roles={['admin']}><AdminDashboard /></RequireRole>} />
          <Route path="/admin/received" element={<RequireRole roles={['admin']}><AdminReceivedStock /></RequireRole>} />
          <Route path="/admin/unpaid" element={<RequireRole roles={['admin']}><AdminUnpaidStock /></RequireRole>} />
          <Route path="/admin/supply" element={<RequireRole roles={['admin']}><AdminSupplyRequests /></RequireRole>} />
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  )
}
