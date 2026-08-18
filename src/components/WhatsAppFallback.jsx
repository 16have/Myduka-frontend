import { WHATSAPP_NUMBER, APP_NAME } from "../../config";

// ---------------------------------------------------------------------------
// WhatsApp fallback for payment failures / delays.
// Builds a pre-filled WhatsApp message and opens wa.me in a new tab.
//
// SECURITY: never include passwords, PINs, API keys or payment credentials
// in the message. Only non-sensitive transaction details are allowed.
// The destination number comes from config.js (VITE_WHATSAPP_NUMBER) —
// it is defined in exactly ONE place.
// ---------------------------------------------------------------------------
export default function WhatsAppFallback({
  referenceNumber,
  product,
  amount,
  userName,
  paymentStatus,
  issue = "Payment unsuccessful or delayed",
}) {
  const lines = [
    `Hello ${APP_NAME} support,`,
    `I need help with a payment issue.`,
    ``,
    `Reference: ${referenceNumber || "N/A"}`,
    product ? `Product: ${product}` : null,
    amount != null ? `Amount: KES ${Number(amount).toLocaleString()}` : null,
    userName ? `Name: ${userName}` : null,
    `Payment status: ${paymentStatus || "Not Paid"}`,
    `Issue: ${issue}`,
  ].filter(Boolean);

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    lines.join("\n")
  )}`;

  return (
    <div className="whatsapp-fallback">
      <p className="whatsapp-fallback-text">
        Payment unsuccessful or delayed? Send your transaction details through
        WhatsApp.
      </p>
      <a
        className="btn btn-whatsapp"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Send Transaction to WhatsApp
      </a>
    </div>
  );
}
