import { readFile } from "node:fs/promises";
import path from "node:path";

import { predictWithLexicons } from "./sentiment";
import type { SentimentPrediction } from "./types";

export interface LocalModelFile {
  version: number;
  type: string;
  positive: string[];
  negative: string[];
}

export interface LocalModel {
  version: number;
  type: string;
  predict(text: string): SentimentPrediction;
}

let modelPromise: Promise<LocalModel | null> | null = null;

export function loadLocalModel(): Promise<LocalModel | null> {
  if (!modelPromise) {
    modelPromise = readModel();
  }

  return modelPromise;
}

async function readModel(): Promise<LocalModel | null> {
  try {
    const filePath = path.join(process.cwd(), "public", "model.json");
    const raw = await readFile(filePath, "utf8");
    const metadata = JSON.parse(raw) as LocalModelFile;

    if (
      !Array.isArray(metadata.positive) ||
      !Array.isArray(metadata.negative)
    ) {
      return null;
    }

    const positive = new Set(
      metadata.positive.map((word) => word.toLowerCase()),
    );
    const negative = new Set(
      metadata.negative.map((word) => word.toLowerCase()),
    );

    return {
      version: metadata.version,
      type: metadata.type,
      predict: (text) => predictWithLexicons(text, positive, negative),
    };
  } catch {
    return null;
  }
}
