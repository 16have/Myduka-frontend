export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <p className="error-box-title">Something went wrong</p>
      <p className="error-box-message">{message}</p>
      {onRetry && (
        <button className="btn btn-outline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
