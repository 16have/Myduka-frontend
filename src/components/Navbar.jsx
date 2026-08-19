import { useApp } from "../context/AppContext";

// Top navigation. Black background per the MyDuka brand (green/black/white).
export default function Navbar({ page, onNavigate }) {
  const { currentUser, role, setRole } = useApp();

  const clerkLinks = [
    { key: "clerk-dashboard", label: "Dashboard" },
    { key: "receive-stock", label: "Receive Stock" },
    { key: "stock", label: "Stock" },
    { key: "spoilage", label: "Spoilage" },
    { key: "supply-requests", label: "Supply Requests" },
  ];

  const adminLinks = [
    { key: "admin-dashboard", label: "Dashboard" },
    { key: "admin-received", label: "Received Stock" },
    { key: "admin-unpaid", label: "Unpaid / Payments" },
    { key: "admin-supply", label: "Supply Requests" },
  ];

  const links = role === "admin" ? adminLinks : clerkLinks;

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => onNavigate(links[0].key)}>
        <span className="navbar-logo">My</span>Duka
      </div>

      <ul className="navbar-links">
        {links.map((link) => (
          <li key={link.key}>
            <button
              className={`navbar-link ${page === link.key ? "active" : ""}`}
              onClick={() => onNavigate(link.key)}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="navbar-user">
        <span className="navbar-username">{currentUser.name}</span>
        {/* Role switcher — replace with real auth in the group project */}
        <select
          className="navbar-role-select"
          value={role}
          onChange={(e) => {
            const newRole = e.target.value;
            setRole(newRole);
            onNavigate(newRole === "admin" ? "admin-dashboard" : "clerk-dashboard");
          }}
        >
          <option value="clerk">Clerk</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </nav>
  );
}
