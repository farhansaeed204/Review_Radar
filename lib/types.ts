export type SentimentLabel = "Positive" | "Negative";

export interface SentimentPrediction {
  label: SentimentLabel;
  confidence: number;
}

export interface AnalyzeResult extends SentimentPrediction {
  explanation: string;
  reply: string;
  aiGenerated: boolean;
}
