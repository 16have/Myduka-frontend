function Unauthorized() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <h1>403</h1>
      <h2>Access Denied</h2>
      <p>
        You do not have permission to access this page.
      </p>
    </div>
  );
}

export default Unauthorized;