# Farmer call demo

Open `http://localhost:5173/farmer`. This is a mobile-first simulated call
experience for the hackathon demo. The call stage uses Gather's polished
feature-phone visual and moves through dialing, ringing, and connected states.
It uses browser voice capabilities when
available, but the demo never depends on a microphone, speech recognition, an
LLM, or provider credentials.

## Demo click path

1. Open the Farmer call route and tap **Call Gather**.
2. Let the browser speak the welcome prompt.
3. Tap **Use demo response**. It supplies the canonical sentence:
   “I have 310 bags of maize in Kaduna available tomorrow at 34,000 naira per
   bag.”
4. Review the transcript and the **Gather understood** card.
5. Tap **Confirm harvest**.
6. If the Flask API is running, the request is posted to `/api/supplies`; if it
   is not, the app shows a deterministic demo-safe success state and explains
   that the supply was not published.

The optional live path is **Speak your harvest**. Chrome-based browsers may
provide `SpeechRecognition`; the app requests `en-NG`, reads the first result,
and sends it through the same deterministic interpreter. When unavailable or
when recognition fails, the **Use demo response** button remains available.
There is also a small text input for testing the same path without a mic.

## Local interpreter

`src/lib/supplyInterpreter.ts` extracts known crops, quantities and units,
locations after “in”, prices after “at” or “for”, and `today`, `tomorrow`, or an
ISO date. It normalizes the canonical phrase to:

```json
{
  "crop": "maize",
  "quantity": 310,
  "unit": "bags",
  "location": "Kaduna",
  "price_per_unit": 34000,
  "available_date": "<tomorrow in the browser's local date>"
}
```

## Backend configuration

Set `VITE_API_BASE_URL` to the backend origin before starting Vite. For example,
with the Flask API on port 5000:

```powershell
$env:VITE_API_BASE_URL="http://127.0.0.1:5000"
$env:VITE_FARMER_ID="1"
npm run dev
```

The frontend posts to `${VITE_API_BASE_URL}/api/supplies`; with no variable it
uses the same-origin `/api/supplies` path. `VITE_FARMER_ID` supplies the numeric
verified farmer ID required by the current backend contract and defaults to `1`
for the demo.

The exact confirmation payload is:

```json
{
  "farmer_id": 1,
  "crop": "maize",
  "unit": "bags",
  "quantity": 310,
  "price_per_unit": 34000,
  "location": "Kaduna",
  "available_date": "2026-08-22"
}
```

The date is resolved at runtime from the word “tomorrow”. No buyer screen or
Flask/core backend file is changed by this farmer lane.
