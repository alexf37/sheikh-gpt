"use client";
import { useState, useEffect, useRef } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";
import { ModifyWithAIButton } from "@/components/ModifyWithAIButton";

const UPDATE_BANNER_KEY = "sheikhgpt-update-banner-seen-v2";

const rulingSchema = z.object({
  ruling: z
    .enum([
      "HARAM",
      "PROBABLY_HARAM",
      "DEPENDS",
      "PROBABLY_HALAL",
      "HALAL",
      "NEEDS_CLARIFICATION",
    ])
    .nullable(),
  explanation: z.string().nullable(),
  references: z.array(z.string()).nullable(),
  clarifyingQuestion: z.string().nullable(),
});

type Message = {
  role: "user" | "assistant";
  content: string;
};

type RulingData = z.infer<typeof rulingSchema>;

export default function HaramChecker() {
  const [query, setQuery] = useState("");
  const [followUpInput, setFollowUpInput] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const [originalQuery, setOriginalQuery] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [finalRuling, setFinalRuling] = useState<RulingData | null>(null);
  const followUpRef = useRef<HTMLInputElement>(null);

  const {
    object: currentData,
    submit,
    isLoading,
    error,
  } = useObject({
    api: "/api/ruling",
    schema: rulingSchema,
    onFinish: ({ object }) => {
      if (object && object.ruling !== "NEEDS_CLARIFICATION") {
        setFinalRuling(object);
      }
    },
  });

  useEffect(() => {
    const hasSeen = localStorage.getItem(UPDATE_BANNER_KEY);
    if (!hasSeen) {
      setShowBanner(true);
      localStorage.setItem(UPDATE_BANNER_KEY, "true");

      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (showFollowUp && followUpRef.current) {
      followUpRef.current.focus();
    }
  }, [showFollowUp]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!query.trim()) return;

    // Reset state for new query
    setOriginalQuery(query.trim());
    setHistory([]);
    setShowFollowUp(false);
    setFinalRuling(null);

    submit({
      query: query.trim(),
      history: [],
    });
  }

  function handleClarificationResponse(e: React.FormEvent) {
    e.preventDefault();

    if (!followUpInput.trim()) return;

    const userMessage = followUpInput.trim();
    const newHistory: Message[] = [
      ...history,
      {
        role: "assistant",
        content: currentData?.clarifyingQuestion ?? "",
      },
      { role: "user", content: userMessage },
    ];

    setHistory(newHistory);
    setFollowUpInput("");

    submit({
      query: originalQuery,
      history: newHistory,
    });
  }

  function handleFollowUp(e: React.FormEvent) {
    e.preventDefault();

    if (!followUpInput.trim()) return;

    const userMessage = followUpInput.trim();
    const newHistory: Message[] = [
      ...history,
      { role: "user", content: userMessage },
    ];

    setHistory(newHistory);
    setFollowUpInput("");

    submit({
      query: originalQuery,
      history: newHistory,
    });
  }

  function handleStartOver() {
    setQuery("");
    setFollowUpInput("");
    setOriginalQuery("");
    setHistory([]);
    setShowFollowUp(false);
    setFinalRuling(null);
  }

  const displayData = finalRuling ?? currentData;
  const needsClarification = currentData?.ruling === "NEEDS_CLARIFICATION";
  const hasRuling =
    displayData?.ruling && displayData.ruling !== "NEEDS_CLARIFICATION";

  return (
    <div
      data-mwai-id="page-container"
      className="flex min-h-screen flex-col items-center justify-center bg-emerald-900 p-4 text-center"
    >
      {/* Update Banner */}
      <div
        data-mwai-id="update-banner-wrapper"
        className={`fixed left-0 right-0 top-0 z-50 flex justify-center transition-transform duration-500 ease-out ${
          showBanner ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div
          data-mwai-id="update-banner"
          className="m-3 flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-2.5 shadow-lg"
        >
          <span data-mwai-id="update-banner-icon-left" className="text-lg">
            ✨
          </span>
          <span
            data-mwai-id="update-banner-text"
            className="font-semibold text-emerald-900"
          >
            Update: SheikhGPT just got smarter
          </span>
          <span data-mwai-id="update-banner-icon-right" className="text-lg">
            🕌
          </span>
        </div>
      </div>

      <header data-mwai-id="header-section" className="mb-8 w-full max-w-3xl">
        <div
          data-mwai-id="header-content"
          className="border-gold border-b-4 py-4"
        >
          <h1
            data-mwai-id="bismillah-heading"
            className="font-arabic text-gold mb-2 text-4xl md:text-5xl"
          >
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </h1>
          <h2
            data-mwai-id="main-heading"
            className="text-2xl font-semibold text-white md:text-3xl"
          >
            Is It Halal or Haram?
          </h2>
        </div>
      </header>

      <main
        data-mwai-id="main-card"
        className="border-gold relative w-full max-w-2xl rounded-lg border-4 bg-white bg-opacity-90 p-8 shadow-xl"
      >
        <div
          data-mwai-id="corner-decoration-top-left"
          className="absolute left-0 top-0 -ml-2 -mt-2 h-12 w-12 rounded-tl-lg border-l-4 border-t-4 border-emerald-700"
        ></div>
        <div
          data-mwai-id="corner-decoration-top-right"
          className="absolute right-0 top-0 -mr-2 -mt-2 h-12 w-12 rounded-tr-lg border-r-4 border-t-4 border-emerald-700"
        ></div>
        <div
          data-mwai-id="corner-decoration-bottom-left"
          className="absolute bottom-0 left-0 -mb-2 -ml-2 h-12 w-12 rounded-bl-lg border-b-4 border-l-4 border-emerald-700"
        ></div>
        <div
          data-mwai-id="corner-decoration-bottom-right"
          className="absolute bottom-0 right-0 -mb-2 -mr-2 h-12 w-12 rounded-br-lg border-b-4 border-r-4 border-emerald-700"
        ></div>

        <form
          data-mwai-id="query-form"
          onSubmit={handleSubmit}
          className="mb-6"
        >
          <p data-mwai-id="query-instructions" className="mb-4 text-slate-700">
            Enter something to check if it is halal or haram according to
            Islamic teachings.
          </p>

          <div data-mwai-id="query-input-wrapper" className="relative">
            <input
              data-mwai-id="query-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your question here..."
              className="w-full rounded-lg border-2 border-emerald-600 bg-emerald-50 p-4 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              data-mwai-id="check-ruling-button"
              type="submit"
              disabled={isLoading || !query.trim()}
              className="mt-4 w-full rounded-lg bg-emerald-700 px-8 py-3 font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50 md:w-auto"
            >
              {isLoading ? (
                <span
                  data-mwai-id="loading-indicator"
                  className="flex items-center justify-center"
                >
                  <svg
                    className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Consulting Teachings...
                </span>
              ) : (
                "Check Ruling"
              )}
            </button>
          </div>
        </form>

        {error && (
          <div
            data-mwai-id="error-message"
            className="mt-6 rounded-lg border-2 border-red-300 bg-red-100 p-4"
          >
            <p data-mwai-id="error-text" className="text-red-700">
              Error: Unable to check ruling at this time. Please try again
              later.
            </p>
          </div>
        )}

        {/* Clarifying Question UI */}
        {needsClarification && !error && (
          <div
            data-mwai-id="clarification-section"
            className="mt-6 rounded-lg border-2 border-amber-300 bg-amber-50 p-6"
          >
            <div
              data-mwai-id="clarification-header"
              className="mb-4 flex items-start gap-3"
            >
              <div
                data-mwai-id="clarification-icon"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-200"
              >
                <span className="text-amber-700">?</span>
              </div>
              <div data-mwai-id="clarification-content" className="text-left">
                <p
                  data-mwai-id="clarification-label"
                  className="mb-1 text-sm font-medium text-amber-800"
                >
                  A clarifying question
                </p>
                <p
                  data-mwai-id="clarification-question"
                  className="text-gray-700"
                >
                  {currentData?.clarifyingQuestion}
                </p>
              </div>
            </div>
            <form
              data-mwai-id="clarification-form"
              onSubmit={handleClarificationResponse}
              className="mt-4"
            >
              <input
                data-mwai-id="clarification-input"
                ref={followUpRef}
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Type your response..."
                className="w-full rounded-lg border-2 border-amber-300 bg-white p-3 text-base focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                disabled={isLoading}
              />
              <button
                data-mwai-id="clarification-submit-button"
                type="submit"
                disabled={isLoading || !followUpInput.trim()}
                className="mt-3 w-full rounded-lg bg-amber-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Submit"}
              </button>
            </form>
          </div>
        )}

        {/* Ruling Display */}
        {hasRuling && !error && (
          <section
            data-mwai-id="ruling-section"
            className={`mt-6 rounded-lg p-6 ${
              displayData?.ruling === "HARAM" ||
              displayData?.ruling === "PROBABLY_HARAM"
                ? "border-2 border-red-300 bg-red-50"
                : displayData?.ruling === "HALAL" ||
                    displayData?.ruling === "PROBABLY_HALAL"
                  ? "border-2 border-green-300 bg-green-50"
                  : "border-2 border-yellow-300 bg-yellow-50"
            }`}
          >
            <h3
              data-mwai-id="ruling-title"
              className={`mb-2 text-2xl font-bold ${
                displayData?.ruling === "HARAM"
                  ? "text-red-700"
                  : displayData?.ruling === "PROBABLY_HARAM"
                    ? "text-red-600"
                    : displayData?.ruling === "HALAL"
                      ? "text-green-700"
                      : displayData?.ruling === "PROBABLY_HALAL"
                        ? "text-green-600"
                        : "text-yellow-700"
              }`}
            >
              {displayData?.ruling === "HARAM"
                ? "Haram (حرام)"
                : displayData?.ruling === "PROBABLY_HARAM"
                  ? "Probably Haram (غالباً حرام)"
                  : displayData?.ruling === "HALAL"
                    ? "Halal (حلال)"
                    : displayData?.ruling === "PROBABLY_HALAL"
                      ? "Probably Halal (غالباً حلال)"
                      : "It Depends"}
            </h3>
            <p data-mwai-id="ruling-explanation" className="text-gray-700">
              {displayData?.explanation}
            </p>

            {displayData?.references && displayData.references.length > 0 && (
              <div
                data-mwai-id="references-section"
                className="mt-4 border-t border-gray-300 pt-4"
              >
                <p
                  data-mwai-id="references-label"
                  className="text-sm font-semibold"
                >
                  References:
                </p>
                <ul
                  data-mwai-id="references-list"
                  className="mt-2 list-disc pl-5 text-left text-sm text-gray-600"
                >
                  {displayData.references.map((ref) => (
                    <li key={ref}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up Section */}
            {!isLoading && (
              <div
                data-mwai-id="followup-section"
                className="mt-5 border-t border-gray-200 pt-5"
              >
                {!showFollowUp ? (
                  <button
                    data-mwai-id="ask-followup-button"
                    type="button"
                    onClick={() => setShowFollowUp(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm text-gray-600 transition-colors hover:border-emerald-500 hover:text-emerald-700"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Ask a follow-up question
                  </button>
                ) : (
                  <form
                    data-mwai-id="followup-form"
                    onSubmit={handleFollowUp}
                    className="space-y-3"
                  >
                    <p
                      data-mwai-id="followup-instructions"
                      className="text-left text-sm text-gray-600"
                    >
                      Ask for clarification or more detail about this ruling
                    </p>
                    <input
                      data-mwai-id="followup-input"
                      ref={followUpRef}
                      type="text"
                      value={followUpInput}
                      onChange={(e) => setFollowUpInput(e.target.value)}
                      placeholder="e.g., What if it's for medical purposes?"
                      className="w-full rounded-lg border-2 border-gray-200 bg-white p-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      disabled={isLoading}
                    />
                    <div data-mwai-id="followup-buttons" className="flex gap-2">
                      <button
                        data-mwai-id="followup-cancel-button"
                        type="button"
                        onClick={() => {
                          setShowFollowUp(false);
                          setFollowUpInput("");
                        }}
                        className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        data-mwai-id="followup-submit-button"
                        type="submit"
                        disabled={isLoading || !followUpInput.trim()}
                        className="flex-1 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"
                      >
                        Ask
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </section>
        )}

        {/* Loading State (when waiting for ruling after clarification) */}
        {isLoading && !currentData?.ruling && history.length > 0 && (
          <div
            data-mwai-id="loading-state"
            className="mt-6 flex items-center justify-center rounded-lg border-2 border-gray-200 bg-gray-50 p-8"
          >
            <svg
              className="mr-3 h-6 w-6 animate-spin text-emerald-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span data-mwai-id="loading-text" className="text-gray-600">
              Analyzing your response...
            </span>
          </div>
        )}
      </main>

      <footer
        data-mwai-id="footer-section"
        className="mt-8 w-full max-w-3xl text-sm text-white opacity-75"
      >
        <div
          data-mwai-id="footer-content"
          className="border-gold border-t-2 pt-4"
        >
          <p data-mwai-id="footer-advice">
            Seek knowledge from authoritative Islamic sources and scholars.
          </p>
          <p data-mwai-id="footer-disclaimer">
            This tool provides guidance based on general Islamic principles, but
            may not account for all nuances or differences between schools of
            thought.
          </p>
        </div>
      </footer>

      <ModifyWithAIButton />
    </div>
  );
}
