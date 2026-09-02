import { useNavigate } from "react-router";

export default function BackButton({ to, label = "Back" }) {
  const navigate = useNavigate();
  return (
    <button className="btn btn-outline" onClick={() => navigate(to || -1)}>
      ← {label}
    </button>
  );
}
