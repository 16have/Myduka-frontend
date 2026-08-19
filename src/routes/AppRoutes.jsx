import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Unauthorized from "../pages/auth/Unauthorized";

import ClerkDashboard from "../pages/clerk/ClerkDashboard";
import ClerkInventory from "../pages/clerk/Inventory";
import ReceivedStock from "../pages/clerk/ReceivedStock";
import Spoilage from "../pages/clerk/Spoilage";
import ClerkSupplyRequests from "../pages/clerk/SupplyRequests";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminInventory from "../pages/admin/Inventory";
import AdminProducts from "../pages/admin/Products";
import AdminSupplyRequests from "../pages/admin/SupplyRequests";
import Payments from "../pages/admin/Payments";
import Clerks from "../pages/admin/Clerks";
import Reports from "../pages/admin/Reports";

import MerchantDashboard from "../pages/merchant/MerchantDashboard";
import Stores from "../pages/merchant/Stores";
import MerchantProducts from "../pages/merchant/Products";
import Admins from "../pages/merchant/Admins";
import MerchantReports from "../pages/merchant/Reports";

function getDashboardPath(role) {
  if (role === "merchant") return "/merchant/dashboard";
  if (role === "admin") return "/admin/dashboard";
  if (role === "clerk") return "/clerk/dashboard";
  return "/login";
}

function AppRoutes() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={getDashboardPath(user?.role)} replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getDashboardPath(user?.role)} replace />
          ) : (
            <Login />
          )
        }
      />

      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/clerk/dashboard"
        element={
          <ProtectedRoute allowedRoles={["clerk"]}>
            <ClerkDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clerk/inventory"
        element={
          <ProtectedRoute allowedRoles={["clerk"]}>
            <ClerkInventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clerk/received-stock"
        element={
          <ProtectedRoute allowedRoles={["clerk"]}>
            <ReceivedStock />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clerk/spoilage"
        element={
          <ProtectedRoute allowedRoles={["clerk"]}>
            <Spoilage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clerk/supply-requests"
        element={
          <ProtectedRoute allowedRoles={["clerk"]}>
            <ClerkSupplyRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminInventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/supply-requests"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSupplyRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Payments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clerks"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Clerks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/merchant/dashboard"
        element={
          <ProtectedRoute allowedRoles={["merchant"]}>
            <MerchantDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/merchant/stores"
        element={
          <ProtectedRoute allowedRoles={["merchant"]}>
            <Stores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/merchant/products"
        element={
          <ProtectedRoute allowedRoles={["merchant"]}>
            <MerchantProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/merchant/admins"
        element={
          <ProtectedRoute allowedRoles={["merchant"]}>
            <Admins />
          </ProtectedRoute>
        }
      />
      <Route
        path="/merchant/reports"
        element={
          <ProtectedRoute allowedRoles={["merchant"]}>
            <MerchantReports />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;