export interface CallLine {
  speaker: "gather" | "farmer";
  text: string;
  /** Marks a verification beat so the UI can render a status pulse. */
  stage?: "verifying" | "verified" | "rejected" | "registered";
}

/** The mocked NDDF (National Digital Database of Farmers) registry. */
export const nddfRegistry: Record<string, { name: string; state: string }> = {
  "NG-4471-2208": { name: "Amina Yusuf", state: "Kaduna" },
  "NG-3390-1174": { name: "Musa Ibrahim", state: "Kaduna" },
  "NG-8812-4456": { name: "Chinedu Okafor", state: "Kaduna" },
};

export const verifiedFarmerId = "NG-4471-2208";
export const unverifiedFarmerId = "NG-0000-0000";

/** Happy path: ID found in NDDF, name confirmed, supply captured. */
export const callScript: CallLine[] = [
  {
    speaker: "gather",
    text: "Hello, welcome to gather. Please say or enter your farmer ID.",
  },
  { speaker: "farmer", text: "NG-4471-2208." },
  {
    speaker: "gather",
    text: "Checking the NDDF register…",
    stage: "verifying",
  },
  {
    speaker: "gather",
    text: "ID confirmed. Is your name Amina Yusuf?",
    stage: "verified",
  },
  { speaker: "farmer", text: "Yes, that is my name." },
  {
    speaker: "gather",
    text: "Thank you. Your gather farmer ID has been created.",
    stage: "registered",
  },
  { speaker: "gather", text: "What produce do you have?" },
  { speaker: "farmer", text: "I have 120 bags of maize." },
  { speaker: "gather", text: "Where are you located?" },
  { speaker: "farmer", text: "Kaduna." },
  { speaker: "gather", text: "When will it be ready?" },
  { speaker: "farmer", text: "Tomorrow." },
  {
    speaker: "gather",
    text: "Got it — 120 bags of maize from Kaduna, ready tomorrow. Thank you.",
  },
];

/** Failure path: ID not present in the NDDF register. */
export const rejectedCallScript: CallLine[] = [
  {
    speaker: "gather",
    text: "Hello, welcome to gather. Please say or enter your farmer ID.",
  },
  { speaker: "farmer", text: "NG-0000-0000." },
  {
    speaker: "gather",
    text: "Checking the NDDF register…",
    stage: "verifying",
  },
  {
    speaker: "gather",
    text: "That ID is not on the NDDF register, so we cannot verify you as a farmer.",
    stage: "rejected",
  },
  {
    speaker: "gather",
    text: "Please register with the NDDF and call back. Goodbye.",
  },
];

export const capturedSupply = {
  crop: "Maize",
  bags: 120,
  location: "Kaduna",
  availability: "Available tomorrow",
};

export const verifiedFarmer = nddfRegistry[verifiedFarmerId];
