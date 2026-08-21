import type { MatchedSupplier, OrderSummary, ProcurementRequest } from "./types";

/** Best-effort API adapter. The UI keeps its deterministic demo state if Flask is absent. */
// VITE_API_BASE_URL is the backend origin, e.g. http://127.0.0.1:5000.
// With no value, requests stay same-origin under /api.
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const configuredBuyerId = Number(import.meta.env.VITE_BUYER_ID ?? "1");
const BUYER_ID = Number.isInteger(configuredBuyerId) ? configuredBuyerId : 1;

export interface DemandStatusResponse {
  demandId?: string;
  status?: string;
  requested?: number;
  gathered?: number;
  remaining?: number;
  percentage?: number;
  farmersToNotify?: number;
  orderId?: string;
}

interface ApiDemandStatus {
  demand_id?: string | number;
  id?: string | number;
  status?: string;
  requested?: number;
  quantity?: number;
  gathered?: number;
  matched_bags?: number;
  remaining?: number;
  percentage?: number;
  farmers_to_notify?: number | string[];
  order_id?: string | number;
}

interface ApiDemandResponse {
  demand_id?: string | number;
  id?: string | number;
}

interface ApiAllocation {
  farmer_id?: string;
  farmer_name?: string;
  supplier_name?: string;
  name?: string;
  location?: string;
  supply_id?: string;
  quantity?: number;
  bags?: number;
  contributed_bags?: number;
  allocated_quantity?: number;
  price_per_unit?: number;
  ready_in_days?: number;
}

interface ApiOrderResponse {
  order_id?: string | number;
  id?: string | number;
  demand_id?: string | number;
  status?: string;
  crop?: "Maize" | "Rice" | "Tomatoes" | "Cassava" | "Soybeans";
  grade?: "Grade A" | "Grade B";
  quantity?: number;
  total_quantity?: number;
  total_value?: number;
  delivery_location?: string;
  allocations?: ApiAllocation[];
}

function apiUrl(path: string) {
  return `${API_ORIGIN}/api${path}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 1600);
  try {
    const response = await fetch(apiUrl(path), {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!response.ok) throw new Error(`Gather API returned ${response.status}`);
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function createDemand(request: ProcurementRequest) {
  const response = await requestJson<ApiDemandResponse>("/demands", {
    method: "POST",
    body: JSON.stringify({
      buyer_id: BUYER_ID,
      raw_text: `Need ${request.quantityBags} bags of ${request.crop} (${request.grade}) in ${request.buyerLocation} by ${request.requiredDate}`,
      crop: request.crop.toLowerCase(),
      unit: request.unit,
      quantity: request.quantityBags,
      location: request.buyerLocation,
      required_date: request.requiredDate,
      max_price_per_unit: request.maxPricePerUnit,
    }),
  });
  const id = response.demand_id ?? response.id;
  if (id === undefined || id === null) throw new Error("Gather API did not return a demand id");
  return { id: String(id) };
}

export async function getDemandStatus(id: string) {
  const response = await requestJson<ApiDemandStatus>(`/demands/${encodeURIComponent(id)}/status`);
  const farmersToNotify = response.farmers_to_notify;
  const demandId = response.demand_id ?? response.id;
  return {
    demandId: demandId === undefined || demandId === null ? undefined : String(demandId),
    status: response.status,
    requested: response.requested ?? response.quantity,
    gathered: response.gathered ?? response.matched_bags,
    remaining: response.remaining,
    percentage: response.percentage,
    farmersToNotify: Array.isArray(farmersToNotify) ? farmersToNotify.length : farmersToNotify,
    orderId: response.order_id === undefined || response.order_id === null ? undefined : String(response.order_id),
  } satisfies DemandStatusResponse;
}

export async function getOrder(id: string): Promise<OrderSummary> {
  const response = await requestJson<ApiOrderResponse>(`/orders/${encodeURIComponent(id)}`);
  const orderId = response.order_id ?? response.id ?? id;
  const demandId = response.demand_id;
  const allocations: MatchedSupplier[] = (response.allocations ?? []).map((allocation, index) => ({
    id: allocation.supply_id ?? allocation.farmer_id ?? `api-supplier-${index + 1}`,
    name: allocation.farmer_name ?? allocation.supplier_name ?? allocation.name ?? "Verified farmer",
    location: allocation.location ?? "Farmer network",
    distanceKm: 0,
    crop: response.crop ?? "Maize",
    grade: response.grade ?? "Grade A",
    availableBags: allocation.allocated_quantity ?? allocation.quantity ?? allocation.bags ?? allocation.contributed_bags ?? 0,
    contributedBags: allocation.allocated_quantity ?? allocation.quantity ?? allocation.bags ?? allocation.contributed_bags ?? 0,
    readyInDays: allocation.ready_in_days ?? 3,
  }));
  return {
    id: String(orderId),
    demandId: demandId === undefined || demandId === null ? "" : String(demandId),
    crop: response.crop ?? "Maize",
    grade: response.grade ?? "Grade A",
    totalBags: response.quantity ?? response.total_quantity ?? allocations.reduce((sum, allocation) => sum + allocation.contributedBags, 0),
    totalValue: response.total_value,
    deliveryLocation: response.delivery_location ?? "Kaduna",
    readyByDays: Math.max(0, ...allocations.map((allocation) => allocation.readyInDays)),
    suppliers: allocations,
  };
}
