"use client";

import { useMemo, useState } from "react";

import type { AnalyzeResult } from "@/lib/types";

const MAX_LENGTH = 2000;

const SAMPLES = [
  {
    label: "Happy customer",
    text: "The delivery was incredibly fast and the quality is excellent. The support team was friendly and helped me set everything up. I would absolutely recommend this to a friend.",
  },
  {
    label: "Unhappy customer",
    text: "My order arrived two weeks late and the box was damaged. The product stopped working after a day. Support was slow and rude, and I am still waiting for a refund.",
  },
];

export default function Home() {
  const [review, setReview] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPositive = result?.label === "Positive";
  const canAnalyze = review.trim().length > 0 && !loading;

  const meterColor = useMemo(
    () => (isPositive ? "bg-emerald-500" : "bg-rose-500"),
    [isPositive],
  );

  async function handleAnalyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canAnalyze) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: review.trim() }),
      });

      const data = (await response.json()) as AnalyzeResult & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setResult(data);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyReply() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.reply);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy automatically. Please select the reply manually.");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_60rem_at_120%_-10%,#e0e7ff_0%,transparent_55%),radial-gradient(50rem_50rem_at_-10%_10%,#fce7f3_0%,transparent_50%)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-10 sm:px-6 sm:py-16">
        <header className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
            <RadarIcon />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">ReviewRadar</p>
            <p className="text-sm text-slate-500">Understand every review in seconds.</p>
          </div>
        </header>

        <section className="mt-10 sm:mt-14">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            What is your customer saying?
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600">
            Paste a review below. ReviewRadar predicts the sentiment, explains the
            why, and drafts a polite reply you can send.
          </p>
        </section>

        <form
          onSubmit={handleAnalyze}
          className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="review"
              className="text-sm font-medium text-slate-700"
            >
              Customer review
            </label>
            <span className="text-xs tabular-nums text-slate-400">
              {review.length}/{MAX_LENGTH}
            </span>
          </div>

          <textarea
            id="review"
            name="review"
            rows={6}
            maxLength={MAX_LENGTH}
            value={review}
            onChange={(event) => setReview(event.target.value)}
            placeholder="e.g. The delivery was fast and the product works perfectly. I would definitely recommend it."
            className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-[15px] leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Try a sample:</span>
            {SAMPLES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setReview(sample.text);
                  setError(null);
                }}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              >
                {sample.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Predictions run locally. Gemini writes the explanation and reply.
            </p>
            <button
              type="submit"
              disabled={!canAnalyze}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  Analyzing...
                </>
              ) : (
                <>
                  <RadarIcon className="h-4 w-4" />
                  Analyze review
                </>
              )}
            </button>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {error}
            </p>
          ) : null}
        </form>

        {result ? (
          <section aria-live="polite" className="mt-6 animate-fade-up space-y-4">
            <div
              className={`rounded-3xl border p-5 sm:p-6 ${
                isPositive
                  ? "border-emerald-200 bg-emerald-50/70"
                  : "border-rose-200 bg-rose-50/70"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-2xl text-white shadow-lg ${
                      isPositive
                        ? "bg-emerald-500 shadow-emerald-500/25"
                        : "bg-rose-500 shadow-rose-500/25"
                    }`}
                  >
                    {isPositive ? <TrendUpIcon /> : <TrendDownIcon />}
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Sentiment
                    </p>
                    <p
                      className={`text-2xl font-semibold ${
                        isPositive ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {result.label}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-3xl font-semibold tabular-nums ${
                      isPositive ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {result.confidence}%
                  </p>
                  <p className="text-xs text-slate-500">confidence</p>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/80">
                <div
                  className={`h-full rounded-full ${meterColor} transition-all duration-700`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <SparkleIcon />
                  Why this prediction
                </h2>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    result.aiGenerated
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {result.aiGenerated ? "Gemini" : "Demo fallback"}
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                {result.explanation}
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <ChatIcon />
                  Suggested reply
                </h2>
                <button
                  type="button"
                  onClick={copyReply}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/20"
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <blockquote className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-[15px] leading-relaxed text-slate-700">
                {result.reply}
              </blockquote>
            </article>
          </section>
        ) : null}

        <footer className="mt-auto pt-10 text-center text-xs text-slate-400">
          Placeholder sentiment model + Gemini 2.5 Flash-Lite
        </footer>
      </div>
    </main>
  );
}

function RadarIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="M12 12 19 5" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      className="h-4 w-4 text-indigo-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v3M12 18v3M4.2 7.5l2.1 2.1M17.7 14.4l2.1 2.1M3 12h3M18 12h3M4.2 16.5l2.1-2.1M17.7 9.6l2.1-2.1" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      className="h-4 w-4 text-indigo-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z" />
      <path d="M8 11h8M8 15h5" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 text-emerald-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

function TrendUpIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  );
}

function TrendDownIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 7 6 6 4-4 8 8" />
      <path d="M15 17h6v-6" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
