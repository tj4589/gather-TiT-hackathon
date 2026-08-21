import type { ProcurementRequest } from "./types";

const ACTIVE_DEMAND_ID_KEY = "gather_active_demand_id";
const ACTIVE_REQUEST_KEY = "gather_active_request";

export interface ActiveDemoSession {
  demandId: string;
  request: ProcurementRequest;
}

export function readActiveDemoSession(): ActiveDemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const demandId = window.sessionStorage.getItem(ACTIVE_DEMAND_ID_KEY);
    const rawRequest = window.sessionStorage.getItem(ACTIVE_REQUEST_KEY);
    if (!demandId || !rawRequest) return null;
    const request = JSON.parse(rawRequest) as ProcurementRequest;
    if (!request.crop || !request.quantityBags || !request.buyerLocation || !request.requiredDate) return null;
    return { demandId, request };
  } catch {
    return null;
  }
}

export function saveActiveDemoSession(demandId: string, request: ProcurementRequest) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ACTIVE_DEMAND_ID_KEY, demandId);
    window.sessionStorage.setItem(ACTIVE_REQUEST_KEY, JSON.stringify(request));
  } catch {
    // Session storage can be unavailable in private browsing.
  }
}

export function clearActiveDemoSession() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(ACTIVE_DEMAND_ID_KEY);
    window.sessionStorage.removeItem(ACTIVE_REQUEST_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}
