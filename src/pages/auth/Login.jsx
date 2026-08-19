import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { loginSuccess } from "../../features/auth/authSlice";

const DEMO_SUPERUSER = {
  email: "superadmin@myduka.com",
  password: "Admin@123",
  role: "admin",
  name: "Super Admin",
};

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const isDemoSuperuser =
      formData.email.trim().toLowerCase() === DEMO_SUPERUSER.email &&
      formData.password === DEMO_SUPERUSER.password;

    try {
      if (isDemoSuperuser) {
        const user = {
          id: "demo-superuser",
          email: DEMO_SUPERUSER.email,
          role: DEMO_SUPERUSER.role,
          name: DEMO_SUPERUSER.name,
        };

        dispatch(
          loginSuccess({
            token: "demo-superuser-token",
            user,
          })
        );

        navigate("/admin/dashboard");
        return;
      }

      const response = await api.post("/auth/login", formData);

      const { token, user } = response.data;

      dispatch(
        loginSuccess({
          token,
          user,
        })
      );

      if (user.role === "merchant") {
        navigate("/merchant/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "clerk") {
        navigate("/clerk/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>MyDuka</h1>
          <h2>Welcome Back</h2>
          <p>Sign in to manage your store.</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button auth-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;