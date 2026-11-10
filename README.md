# ReviewRadar

ReviewRadar is a small, beginner-friendly Next.js app that reads a customer review and returns:

- a **sentiment prediction** (Positive or Negative) with a confidence score
- a short **explanation** of why the review reads that way
- a **polite suggested reply** you can send to the customer

The UI is a single, clean page. Sentiment comes from a local placeholder model, and the explanation/reply are written by Gemini.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- `@google/generative-ai` with `gemini-2.5-flash-lite`
- No database, no auth, no extra UI libraries

## Getting started (Windows PowerShell)

```powershell
cd D:\workshop
npm install
Copy-Item .env.example .env.local
```

Open `.env.local` and add your Google AI Studio key:

```env
GEMINI_API_KEY=your_google_ai_studio_api_key
```

Then start the app:

```powershell
npm run dev
```

Open http://localhost:3000.

> No API key? The app still works in **Demo fallback** mode. Sentiment and a template explanation/reply are generated locally.

## Getting started (macOS / Linux)

```bash
cd /path/to/reviewradar
npm install
cp .env.example .env.local
npm run dev
```

## Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the development server          |
| `npm run build`     | Create a production build             |
| `npm run start`     | Run the production build              |
| `npm run typecheck` | Type-check the project with `tsc`     |

## API

### `POST /api/analyze`

Request:

```json
{ "text": "The delivery was fast and the product is excellent." }
```

Response:

```json
{
  "label": "Positive",
  "confidence": 88,
  "explanation": "The reviewer highlights fast delivery and product quality...",
  "reply": "Thank you so much for your kind feedback...",
  "aiGenerated": true
}
```

Errors return `{ "error": "..." }` with status `400`. Reviews are limited to 2,000 characters.

## Project structure

```
app/
  api/analyze/route.ts   API route: validate input, predict, call Gemini
  globals.css            Tailwind import and small animations
  icon.svg               App favicon
  layout.tsx             Root layout and metadata
  page.tsx               The single-page UI
lib/
  gemini.ts              Gemini prompt, JSON parsing, local fallback
  model.ts               Loads public/model.json (step 2-ready)
  sentiment.ts           Placeholder keyword sentiment function
  types.ts               Shared TypeScript types
public/
  model.json             Local placeholder model with word lists
.env.example             Environment variable template
```

## How sentiment works today

`lib/model.ts` loads `public/model.json` from disk and scores positive/negative words, including simple negation handling ("not good" counts as negative). If the file is missing or invalid, the API falls back to `lib/sentiment.ts`.

## Swapping in a real ML model later

1. Export your model weights or vocabulary into `public/model.json`.
2. Keep the file server-readable, then update `predict()` inside `lib/model.ts`.
3. The API route needs no changes: it already prefers the local model and falls back to the keyword function.

The response shape stays the same, so the UI keeps working.

## Gemini integration

`lib/gemini.ts` calls `gemini-2.5-flash-lite` with a JSON response mode. If the key is missing, the request fails, or the model returns invalid JSON, it falls back to a safe local explanation and reply and sets `aiGenerated: false`.

## Environment variables

| Name             | Required | Description                          |
| ---------------- | -------- | ------------------------------------ |
| `GEMINI_API_KEY` | No       | Google AI Studio key for Gemini calls |

## Notes

- `.env.local` is gitignored. Never commit real keys.
- This is workshop code: the keyword model is intentionally simple and is not production-grade.
