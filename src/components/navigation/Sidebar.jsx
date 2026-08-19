import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../../features/auth/authSlice";

function Sidebar({ role = "clerk" }) {
  const menus = {
    clerk: [
      { name: "Dashboard", path: "/clerk/dashboard", icon: "📊" },
      { name: "Inventory", path: "/clerk/inventory", icon: "📦" },
      { name: "Received Stock", path: "/clerk/received-stock", icon: "🚚" },
      { name: "Spoilage", path: "/clerk/spoilage", icon: "⚠️" },
      { name: "Supply Requests", path: "/clerk/supply-requests", icon: "📝" },
    ],

    admin: [
      { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
      { name: "Inventory", path: "/admin/inventory", icon: "📦" },
      { name: "Products", path: "/admin/products", icon: "🛍️" },
      { name: "Supply Requests", path: "/admin/supply-requests", icon: "📝" },
      { name: "Payments", path: "/admin/payments", icon: "💳" },
      { name: "Clerks", path: "/admin/clerks", icon: "👥" },
      { name: "Reports", path: "/admin/reports", icon: "📈" },
    ],

    merchant: [
      { name: "Dashboard", path: "/merchant/dashboard", icon: "📊" },
      { name: "Stores", path: "/merchant/stores", icon: "🏪" },
      { name: "Products", path: "/merchant/products", icon: "🛍️" },
      { name: "Admins", path: "/merchant/admins", icon: "👥" },
      { name: "Reports", path: "/merchant/reports", icon: "📈" },
    ],
  };

  const menuItems = menus[role] || menus.clerk;
  const dispatch = useDispatch();
const navigate = useNavigate();

const handleLogout = () => {
  dispatch(logout());
  navigate("/login");
};

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>MyDuka</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="logout-button" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;