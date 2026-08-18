// Single source of truth for app-level configuration.
// Values come from environment variables — never hard-code secrets here.

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// WhatsApp fallback destination (used by the WhatsAppFallback component only).
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "254700000000";

export const APP_NAME = "MyDuka";
