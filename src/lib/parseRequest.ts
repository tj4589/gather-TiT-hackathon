import type { Crop, ProcurementRequest } from "./types";

const CROPS: Crop[] = ["Maize", "Rice", "Tomatoes", "Cassava", "Soybeans"];
const LOCATIONS = ["Kaduna", "Kano", "Benue", "Ogun", "Oyo", "Niger"];
const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export interface ParsedRequest {
  crop: Crop;
  quantityBags: number;
  buyerLocation: string;
  deadlineDays: number;
  deadlineLabel: string;
}

function deadlineLabelFromDays(days: number, today: Date): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  const target = new Date(today);
  target.setDate(target.getDate() + days);
  return WEEKDAYS[target.getDay()].replace(/^\w/, (c) => c.toUpperCase());
}

/** Lightweight NL parse — good enough for a demo, not real NLP. */
export function parseRequest(
  sentence: string,
  today: Date = new Date()
): ParsedRequest | null {
  const text = sentence.toLowerCase();

  const quantityMatch = text.match(/(\d[\d,]*)\s*(bags?)?/);
  const quantityBags = quantityMatch
    ? Number(quantityMatch[1].replace(/,/g, ""))
    : NaN;

  const crop = CROPS.find((c) => text.includes(c.toLowerCase()));
  const buyerLocation = LOCATIONS.find((l) => text.includes(l.toLowerCase()));

  if (!quantityBags || !crop || !buyerLocation) return null;

  let deadlineDays = 3;
  if (text.includes("tomorrow")) {
    deadlineDays = 1;
  } else if (text.includes("today")) {
    deadlineDays = 0;
  } else {
    const weekdayIndex = WEEKDAYS.findIndex((w) => text.includes(w));
    if (weekdayIndex !== -1) {
      deadlineDays = (weekdayIndex - today.getDay() + 7) % 7;
    }
  }

  return {
    crop,
    quantityBags,
    buyerLocation,
    deadlineDays,
    deadlineLabel: deadlineLabelFromDays(deadlineDays, today),
  };
}

export function toProcurementRequest(
  parsed: ParsedRequest
): ProcurementRequest {
  return {
    crop: parsed.crop,
    quantityBags: parsed.quantityBags,
    buyerLocation: parsed.buyerLocation,
    deadlineDays: parsed.deadlineDays,
    grade: "Grade A",
    radiusKm: 50,
  };
}
