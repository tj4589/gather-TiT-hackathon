import type {
  MatchedSupplier,
  OrderSummary,
  ProcurementRequest,
  Supplier,
} from "./types";

export const demoRequest: ProcurementRequest = {
  crop: "Maize",
  unit: "bags",
  quantityBags: 1030,
  buyerLocation: "Kaduna",
  requiredDate: "2026-08-24",
  deadlineDays: 3,
  grade: "Grade A",
  radiusKm: 50,
};

// Suppliers matching the demo request (Maize, Grade A, near Kaduna).
// Within 50km: Amina + Musa + Chinedu + Abdulrahman = 720 bags exactly.
// Within 100km: + Zaria Farmers' Cooperative = 1,030 bags across 5 suppliers.
export const demoSuppliers: Supplier[] = [
  {
    id: "s1",
    name: "Amina Yusuf",
    location: "Kaduna",
    distanceKm: 12,
    crop: "Maize",
    grade: "Grade A",
    availableBags: 120,
    readyInDays: 1,
  },
  {
    id: "s2",
    name: "Musa Ibrahim",
    location: "Kaduna",
    distanceKm: 23,
    crop: "Maize",
    grade: "Grade A",
    availableBags: 180,
    readyInDays: 2,
  },
  {
    id: "s3",
    name: "Chinedu Okafor",
    location: "Kaduna",
    distanceKm: 31,
    crop: "Maize",
    grade: "Grade A",
    availableBags: 220,
    readyInDays: 1,
  },
  {
    id: "s4",
    name: "Abdulrahman Bello",
    location: "Kaduna",
    distanceKm: 44,
    crop: "Maize",
    grade: "Grade A",
    availableBags: 200,
    readyInDays: 3,
  },
  {
    id: "s5",
    name: "Zaria Farmers' Cooperative",
    location: "Zaria",
    distanceKm: 82,
    crop: "Maize",
    grade: "Grade A",
    availableBags: 310,
    readyInDays: 3,
  },
];

// Broader supplier pool for secondary screens (dashboard, supply network).
// Not part of the signature-flow arithmetic.
export const networkSuppliers: Supplier[] = [
  ...demoSuppliers,
  {
    id: "n1",
    name: "Grace Adeyemi",
    location: "Oyo",
    distanceKm: 38,
    crop: "Cassava",
    grade: "Grade A",
    availableBags: 150,
    readyInDays: 2,
  },
  {
    id: "n2",
    name: "Ibrahim Sule",
    location: "Kano",
    distanceKm: 19,
    crop: "Rice",
    grade: "Grade B",
    availableBags: 340,
    readyInDays: 4,
  },
  {
    id: "n3",
    name: "Blessing Terhemba",
    location: "Benue",
    distanceKm: 27,
    crop: "Soybeans",
    grade: "Grade A",
    availableBags: 95,
    readyInDays: 1,
  },
  {
    id: "n4",
    name: "Folake Ogundele",
    location: "Ogun",
    distanceKm: 15,
    crop: "Tomatoes",
    grade: "Grade A",
    availableBags: 60,
    readyInDays: 1,
  },
  {
    id: "n5",
    name: "Suleiman Danjuma",
    location: "Niger",
    distanceKm: 51,
    crop: "Rice",
    grade: "Grade A",
    availableBags: 275,
    readyInDays: 5,
  },
];

/** Pure function: returns suppliers matching the request within radiusKm, and the totals. */
export function matchSuppliers(
  request: ProcurementRequest,
  radiusKm: number,
  pool: Supplier[] = demoSuppliers
) {
  const matched = pool
    .filter(
      (s) =>
        s.crop === request.crop &&
        s.grade === request.grade &&
        s.distanceKm <= radiusKm
    )
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const totalBags = matched.reduce((sum, s) => sum + s.availableBags, 0);
  const gapBags = Math.max(0, request.quantityBags - totalBags);
  const percentFulfilled = Math.min(
    100,
    Math.round((totalBags / request.quantityBags) * 100)
  );

  return {
    matched: matched.map((supplier) => ({
      ...supplier,
      contributedBags: Math.min(
        supplier.availableBags,
        Math.max(0, request.quantityBags - matched
          .slice(0, matched.indexOf(supplier))
          .reduce((sum, previous) => sum + previous.availableBags, 0)),
      ),
    })),
    totalBags,
    gapBags,
    percentFulfilled,
  };
}

export function createDemoOrder(
  request: ProcurementRequest,
  suppliers: MatchedSupplier[],
): OrderSummary {
  return {
    id: "demo-order-001",
    demandId: "demo-demand-001",
    crop: request.crop,
    grade: request.grade,
    totalBags: suppliers.reduce((sum, supplier) => sum + supplier.contributedBags, 0),
    deliveryLocation: request.buyerLocation,
    readyByDays: Math.max(...suppliers.map((supplier) => supplier.readyInDays)),
    suppliers,
  };
}
