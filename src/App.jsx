import { Navigate, Route, Routes } from 'react-router'
import { Toaster } from 'sonner'
import { AuthProvider, RequireAuth, RequireRole, useAuth, homeFor } from '@/lib/auth'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import RegisterAdmin from '@/pages/RegisterAdmin'
import AdminManagement from '@/pages/merchant/AdminManagement'
import ClerkManagement from '@/pages/admin/ClerkManagement'
import ClerkWorkspace from '@/pages/ClerkWorkspace'

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
          <Route
            path="/clerk"
            element={
              <RequireRole roles={['clerk']}>
                <ClerkWorkspace />
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
