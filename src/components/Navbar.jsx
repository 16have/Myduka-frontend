import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const role = user?.role || "clerk";


  

  const clerkLinks = [
    { key: "/clerk", label: "Dashboard" },
    { key: "/clerk/receive-stock", label: "Receive Stock" },
    { key: "/clerk/stock", label: "Stock" },
    { key: "/clerk/spoilage", label: "Spoilage" },
    { key: "/clerk/supply-requests", label: "Supply Requests" },
  ];

  const adminLinks = [
    { key: "/admin", label: "Dashboard" },
    { key: "/admin/received", label: "Received Stock" },
    { key: "/admin/unpaid", label: "Unpaid / Payments" },
    { key: "/admin/supply", label: "Supply Requests" },
  ];

  const links = role === "admin" ? adminLinks : clerkLinks;

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate(links[0].key)}>
        <span className="navbar-logo">My</span>Duka
      </div>

      <ul className="navbar-links">
        {links.map((link) => (
          <li key={link.key}>
            <button
              className={`navbar-link ${
                location.pathname === link.key ? "active" : ""
              }`}
              onClick={() => navigate(link.key)}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="navbar-user">
        <span className="navbar-username">{user?.name}</span>
      </div>
    </nav>
  );
}
