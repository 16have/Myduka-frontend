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
}
