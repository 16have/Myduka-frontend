function Register() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>MyDuka</h1>
          <h2>Create Account</h2>
          <p>Register a new merchant or admin account.</p>
        </div>

        <form>
          <div className="form-group">
            <label>Full name</label>
            <input type="text" placeholder="Enter your full name" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Create a password" />
          </div>

          <button type="submit" className="primary-button auth-button">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;