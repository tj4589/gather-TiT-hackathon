export interface CallLine {
  speaker: "gather" | "farmer";
  text: string;
}

export const callScript: CallLine[] = [
  { speaker: "gather", text: "Hello, welcome to gather. What produce do you have?" },
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

export const capturedSupply = {
  crop: "Maize",
  bags: 120,
  location: "Kaduna",
  availability: "Available tomorrow",
};
