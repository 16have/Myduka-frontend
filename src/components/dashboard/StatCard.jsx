function StatCard({ title, value, description, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-icon">{icon}</span>

        <div>
          <p>{title}</p>
          <h2>{value}</h2>
        </div>
      </div>

      {description && (
        <span className="stat-description">
          {description}
        </span>
      )}
    </div>
  );
}

export default StatCard;