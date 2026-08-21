import type { MatchedSupplier, OrderSummary, ProcurementRequest } from "./types";

/** Best-effort API adapter. The UI keeps its deterministic demo state if Flask is absent. */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

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
  demand_id?: string;
  id?: string;
  status?: string;
  requested?: number;
  quantity?: number;
  gathered?: number;
  matched_bags?: number;
  remaining?: number;
  percentage?: number;
  farmers_to_notify?: number | string[];
  order_id?: string;
}

interface ApiDemandResponse {
  demand_id?: string;
  id?: string;
}

interface ApiAllocation {
  farmer_id?: string;
  farmer_name?: string;
  supplier_name?: string;
  name?: string;
  location?: string;
  quantity?: number;
  bags?: number;
  contributed_bags?: number;
  ready_in_days?: number;
}

interface ApiOrderResponse {
  order_id?: string;
  id?: string;
  demand_id?: string;
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
  return `${API_BASE_URL}${path}`;
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
      buyer_id: "demo-buyer-001",
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
  if (!id) throw new Error("Gather API did not return a demand id");
  return { id };
}

export async function getDemandStatus(id: string) {
  const response = await requestJson<ApiDemandStatus>(`/demands/${encodeURIComponent(id)}/status`);
  const farmersToNotify = response.farmers_to_notify;
  return {
    demandId: response.demand_id ?? response.id,
    status: response.status,
    requested: response.requested ?? response.quantity,
    gathered: response.gathered ?? response.matched_bags,
    remaining: response.remaining,
    percentage: response.percentage,
    farmersToNotify: Array.isArray(farmersToNotify) ? farmersToNotify.length : farmersToNotify,
    orderId: response.order_id,
  } satisfies DemandStatusResponse;
}

export async function getOrder(id: string): Promise<OrderSummary> {
  const response = await requestJson<ApiOrderResponse>(`/orders/${encodeURIComponent(id)}`);
  const allocations: MatchedSupplier[] = (response.allocations ?? []).map((allocation, index) => ({
    id: allocation.farmer_id ?? `api-supplier-${index + 1}`,
    name: allocation.farmer_name ?? allocation.supplier_name ?? allocation.name ?? "Verified farmer",
    location: allocation.location ?? "Farmer network",
    distanceKm: 0,
    crop: response.crop ?? "Maize",
    grade: response.grade ?? "Grade A",
    availableBags: allocation.quantity ?? allocation.bags ?? allocation.contributed_bags ?? 0,
    contributedBags: allocation.quantity ?? allocation.bags ?? allocation.contributed_bags ?? 0,
    readyInDays: allocation.ready_in_days ?? 3,
  }));
  return {
    id: response.order_id ?? response.id ?? id,
    demandId: response.demand_id ?? "",
    crop: response.crop ?? "Maize",
    grade: response.grade ?? "Grade A",
    totalBags: response.quantity ?? response.total_quantity ?? allocations.reduce((sum, allocation) => sum + allocation.contributedBags, 0),
    deliveryLocation: response.delivery_location ?? "Kaduna",
    readyByDays: Math.max(0, ...allocations.map((allocation) => allocation.readyInDays)),
    suppliers: allocations,
  };
}
