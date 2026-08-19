import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";

import ClerkDashboard from "./pages/ClerkDashboard";
import ReceiveStockPage from "./pages/ReceiveStockPage";
import StockPage from "./pages/StockPage";
import SpoilagePage from "./pages/SpoilagePage";
import SupplyRequestPage from "./pages/SupplyRequestPage";

import AdminDashboard from "./pages/AdminDashboard";
import AdminReceivedStock from "./pages/AdminReceivedStock";
import AdminUnpaidStock from "./pages/AdminUnpaidStock";
import AdminSupplyRequests from "./pages/AdminSupplyRequests";

import "./styles/main.css";

// Simple page switcher.
// GROUP INTEGRATION NOTE: when merging into the full MyDuka app, replace
// this state-based navigation with your group's router (e.g. React Router)
// and map each key below to a route like /inventory/receive.
const PAGES = {
  "clerk-dashboard": ClerkDashboard,
  "receive-stock": ReceiveStockPage,
  stock: StockPage,
  spoilage: SpoilagePage,
  "supply-requests": SupplyRequestPage,
  "admin-dashboard": AdminDashboard,
  "admin-received": AdminReceivedStock,
  "admin-unpaid": AdminUnpaidStock,
  "admin-supply": AdminSupplyRequests,
};

export default function App() {
  const [page, setPage] = useState("clerk-dashboard");
  const ActivePage = PAGES[page] || ClerkDashboard;

  return (
    <AppProvider>
      <Navbar page={page} onNavigate={setPage} />
      <main>
        <ActivePage onNavigate={setPage} />
      </main>
    </AppProvider>
  );
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
