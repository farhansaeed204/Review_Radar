import type { SentimentLabel } from "./types";

const MODEL_NAME = "gemini-2.5-flash-lite";

export interface Insights {
  explanation: string;
  reply: string;
  aiGenerated: boolean;
}

export async function generateInsights(
  text: string,
  label: SentimentLabel,
  confidence: number,
): Promise<Insights> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return buildFallback(label, confidence);
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.5,
        maxOutputTokens: 1024,
      },
    });

    const result = await model.generateContent(
      buildPrompt(text, label, confidence),
    );
    const parsed = parseInsights(result.response.text());

    if (!parsed) {
      return buildFallback(label, confidence);
    }

    return { ...parsed, aiGenerated: true };
  } catch (error) {
    console.error("Gemini request failed:", error);
    return buildFallback(label, confidence);
  }
}

function buildPrompt(text: string, label: SentimentLabel, confidence: number) {
  return `You are ReviewRadar, a thoughtful customer-experience assistant.

Customer review:
"""
${text}
"""

A local classifier predicted the sentiment as ${label} with ${confidence}% confidence.

Return a JSON object with exactly two string fields:
1. "explanation": 2-3 sentences explaining which words, tone, and details in the review support this sentiment prediction. Be specific, but do not quote more than a few words.
2. "reply": a warm, professional reply to the customer. 2-4 sentences. Thank them, acknowledge specific details from the review, and for negative reviews apologize and offer a concrete next step. Do not invent order numbers or names. Do not use placeholders like [Name].

Respond with JSON only.`;
}

function parseInsights(
  raw: string,
): { explanation: string; reply: string } | null {
  try {
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
    const parsed = JSON.parse(cleaned) as {
      explanation?: unknown;
      reply?: unknown;
    };

    if (
      typeof parsed.explanation !== "string" ||
      typeof parsed.reply !== "string"
    ) {
      return null;
    }

    const explanation = parsed.explanation.trim();
    const reply = parsed.reply.trim();

    if (!explanation || !reply) {
      return null;
    }

    return { explanation, reply };
  } catch {
    return null;
  }
}

function buildFallback(label: SentimentLabel, confidence: number): Insights {
  if (label === "Positive") {
    return {
      explanation: `The review reads as positive with ${confidence}% confidence. The wording highlights satisfaction, quality, or a willingness to recommend, and those cues outweigh any minor complaints.`,
      reply:
        "Thank you so much for taking the time to share this feedback. We are glad the experience met your expectations, and your kind words mean a lot to our team. We look forward to serving you again.",
      aiGenerated: false,
    };
  }

  return {
    explanation: `The review reads as negative with ${confidence}% confidence. The wording points to frustration, delays, or unmet expectations, and those cues outweigh any positive notes.`,
    reply:
      "Thank you for your honest feedback, and I am sorry your experience fell short of expectations. I would like to make this right, so please reply with your order number and our team will look into it right away. We appreciate the chance to improve.",
    aiGenerated: false,
  };
}
