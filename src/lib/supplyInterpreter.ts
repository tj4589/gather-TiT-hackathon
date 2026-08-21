export interface SupplyDraft {
  crop: string;
  quantity: number;
  unit: string;
  location: string;
  price_per_unit: number;
  available_date: string;
}

const CROPS = ["maize", "rice", "tomatoes", "cassava", "soybeans"];

function isoDateFromPhrase(phrase: string): string | null {
  const today = new Date();
  const result = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (/\btomorrow\b/i.test(phrase)) result.setDate(result.getDate() + 1);
  else if (!/\btoday\b/i.test(phrase)) {
    const dateMatch = phrase.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    if (!dateMatch) return null;
    return dateMatch[1];
  }
  return result.toISOString().slice(0, 10);
}

function cleanLocation(value: string): string {
  return value.replace(/[.,]$/, "").trim().replace(/\s+/g, " ").replace(/\b(the|my)\s+/i, "");
}

/** Deterministic local interpreter for farmer speech/text; no LLM is required. */
export function interpretSupply(transcript: string): SupplyDraft | null {
  const text = transcript.trim();
  if (!text) return null;
  const lower = text.toLowerCase();
  const crop = CROPS.find((candidate) => new RegExp(`\\b${candidate}\\b`, "i").test(text));
  const quantityMatch = lower.match(/(\d[\d,]*(?:\.\d+)?)\s*(bags?|kilograms?|kgs?|kg|tonnes?|tons?|crates?)/i);
  const priceMatch = lower.match(/(?:at|for|price(?:\s+is)?|\u20a6)\s*\u20a6?\s*([\d,]+)\s*(?:naira)?/i);
  const locationMatch = text.match(/\bin\s+(.+?)(?=\s+(?:available|ready|at|for|on|today|tomorrow)\b|[.,]|$)/i);
  const availability = isoDateFromPhrase(text);
  if (!crop || !quantityMatch || !priceMatch || !locationMatch || !availability) return null;

  const quantity = Number(quantityMatch[1].replace(/,/g, ""));
  const price = Number(priceMatch[1].replace(/,/g, ""));
  if (!Number.isFinite(quantity) || !Number.isFinite(price) || quantity <= 0 || price < 0) return null;

  const rawUnit = quantityMatch[2].toLowerCase();
  const unit = rawUnit.startsWith("bag") ? "bags" : rawUnit.startsWith("kg") || rawUnit.startsWith("kilogram") ? "kg" : rawUnit.startsWith("ton") ? "tonnes" : "crates";
  return { crop, quantity, unit, location: cleanLocation(locationMatch[1]), price_per_unit: price, available_date: availability };
}

export const DEMO_TRANSCRIPT = "I have 310 bags of maize in Kaduna available tomorrow at 34,000 naira per bag.";

export function supplyPayload(draft: SupplyDraft) {
  const farmerId = Number(import.meta.env.VITE_FARMER_ID || "1");
  return {
    farmer_id: Number.isFinite(farmerId) ? farmerId : 1,
    crop: draft.crop,
    unit: draft.unit,
    quantity: draft.quantity,
    price_per_unit: draft.price_per_unit,
    location: draft.location,
    available_date: draft.available_date,
  };
}

export function apiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
}
