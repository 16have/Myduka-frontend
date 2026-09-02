// Small statistic card used on dashboards.
export default function StatCard({ label, value, variant = "default" }) {
  return (
    <div className={`stat-card stat-card--${variant}`}>
      <span className="stat-card-value">{value}</span>
      <span className="stat-card-label">{label}</span>
    </div>
  );
}
