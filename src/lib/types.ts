export type Crop = "Maize" | "Rice" | "Tomatoes" | "Cassava" | "Soybeans";
export type Grade = "Grade A" | "Grade B";

export interface ProcurementRequest {
  crop: Crop;
  unit: "bags";
  quantityBags: number;
  buyerLocation: string;
  requiredDate: string;
  deadlineDays: number;
  grade: Grade;
  radiusKm: number;
  maxPricePerUnit?: number;
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  crop: Crop;
  grade: Grade;
  availableBags: number;
  readyInDays: number;
}

export interface MatchedSupplier extends Supplier {
  contributedBags: number;
}

export interface OrderSummary {
  id: string;
  demandId: string;
  crop: Crop;
  grade: Grade;
  totalBags: number;
  totalValue?: number;
  deliveryLocation: string;
  readyByDays: number;
  suppliers: MatchedSupplier[];
}
