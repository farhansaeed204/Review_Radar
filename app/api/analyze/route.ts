import { NextResponse } from "next/server";

import { generateInsights } from "@/lib/gemini";
import { loadLocalModel } from "@/lib/model";
import { predictSentiment } from "@/lib/sentiment";
import type { AnalyzeResult } from "@/lib/types";

export const runtime = "nodejs";

const MAX_LENGTH = 2000;

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const text = readText(payload);

  if (!text) {
    return NextResponse.json(
      { error: "Please paste a review to analyze." },
      { status: 400 },
    );
  }

  if (text.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `Reviews must be ${MAX_LENGTH} characters or fewer.` },
      { status: 400 },
    );
  }

  const model = await loadLocalModel();
  const prediction = model ? model.predict(text) : predictSentiment(text);
  const insights = await generateInsights(
    text,
    prediction.label,
    prediction.confidence,
  );

  const result: AnalyzeResult = { ...prediction, ...insights };

  return NextResponse.json(result);
}

function readText(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) {
    return "";
  }

  const value = (payload as Record<string, unknown>).text;

  return typeof value === "string" ? value.trim() : "";
}
