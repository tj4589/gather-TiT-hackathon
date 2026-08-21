export type Crop = "Maize" | "Rice" | "Tomatoes" | "Cassava" | "Soybeans";
export type Grade = "Grade A" | "Grade B";

export interface ProcurementRequest {
  crop: Crop;
  quantityBags: number;
  buyerLocation: string;
  deadlineDays: number;
  grade: Grade;
  radiusKm: number;
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
