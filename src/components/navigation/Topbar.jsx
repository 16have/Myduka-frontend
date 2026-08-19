function Topbar({ title = "Dashboard", userName = "User" }) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
      </div>

      <div className="topbar-user">
        <div className="user-avatar">
          {userName.charAt(0).toUpperCase()}
        </div>

        <div className="user-info">
          <strong>{userName}</strong>
          <span>MyDuka User</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;