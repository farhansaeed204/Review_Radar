import type { SentimentPrediction } from "./types";

const POSITIVE_WORDS = new Set([
  "amazing",
  "awesome",
  "best",
  "brilliant",
  "delighted",
  "excellent",
  "fantastic",
  "fast",
  "friendly",
  "good",
  "great",
  "happy",
  "helpful",
  "impressed",
  "love",
  "loved",
  "perfect",
  "recommend",
  "satisfied",
  "smooth",
  "superb",
  "wonderful",
  "worth",
]);

const NEGATIVE_WORDS = new Set([
  "angry",
  "awful",
  "bad",
  "broken",
  "cheap",
  "damaged",
  "disappointed",
  "disappointing",
  "frustrating",
  "hate",
  "horrible",
  "late",
  "poor",
  "problem",
  "refund",
  "rude",
  "slow",
  "terrible",
  "unhappy",
  "useless",
  "waste",
  "worst",
]);

const NEGATIONS = new Set(["no", "not", "never", "hardly", "barely", "cannot"]);

export function predictWithLexicons(
  text: string,
  positiveWords: ReadonlySet<string>,
  negativeWords: ReadonlySet<string>,
): SentimentPrediction {
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];

  let score = 0;
  let matches = 0;

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    const negated = index > 0 && NEGATIONS.has(words[index - 1]);

    if (positiveWords.has(word)) {
      score += negated ? -1 : 1;
      matches += 1;
    } else if (negativeWords.has(word)) {
      score += negated ? 1 : -1;
      matches += 1;
    }
  }

  if (score === 0) {
    return { label: "Positive", confidence: 52 };
  }

  const strength = Math.abs(score) / matches;
  const confidence = Math.min(95, Math.round(60 + strength * 35));

  return {
    label: score > 0 ? "Positive" : "Negative",
    confidence,
  };
}

export function predictSentiment(text: string): SentimentPrediction {
  return predictWithLexicons(text, POSITIVE_WORDS, NEGATIVE_WORDS);
}
