export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-spinner" role="status">
      <p>{message}</p>
    </div>
  );
}
