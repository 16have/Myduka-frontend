import { Navigate, Outlet, Route, Routes } from 'react-router'
import { Toaster } from 'sonner'
import { AuthProvider, RequireAuth, RequireRole, useAuth, homeFor } from '@/lib/auth'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import RegisterAdmin from '@/pages/RegisterAdmin'
import AdminManagement from '@/pages/merchant/AdminManagement'
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
import Navbar from '@/components/Navbar'
import "./styles/main.css"

function RootRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? homeFor(user.role) : '/login'} replace />
}

function ClerkLayout() {
  return (
    <RequireRole roles={['clerk']}>
      <>
        <Navbar />
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>
          <Outlet />
        </main>
      </>
    </RequireRole>
  )
}

function AdminLayout() {
  return (
    <RequireRole roles={['admin']}>
      <>
        <Navbar />
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>
          <Outlet />
        </main>
      </>
    </RequireRole>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/register" element={<RegisterAdmin />} />

        <Route path="/clerk" element={<ClerkLayout />}>
          <Route index element={<ClerkDashboard />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="receive-stock" element={<ReceiveStockPage />} />
          <Route path="spoilage" element={<SpoilagePage />} />
          <Route path="supply-requests" element={<SupplyRequestPage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="received" element={<AdminReceivedStock />} />
          <Route path="unpaid" element={<AdminUnpaidStock />} />
          <Route path="supply" element={<AdminSupplyRequests />} />
        </Route>

        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
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
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  )
}
