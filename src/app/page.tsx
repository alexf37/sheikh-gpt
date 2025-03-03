"use client";
import { useState } from "react";
import { api } from "@/trpc/react";

export default function HaramChecker() {
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");

  const { data, isLoading, error } = api.isHaram.useQuery(
    { query: inputValue },
    {
      enabled: !!inputValue,
      refetchOnWindowFocus: false,
    },
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!query.trim()) return;

    setInputValue(query.trim());
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-emerald-900 p-4 text-center">
      <div className="mb-8 w-full max-w-3xl">
        <div className="border-gold border-b-4 py-4">
          <h1 className="font-arabic text-gold mb-2 text-4xl md:text-5xl">
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </h1>
          <h2 className="text-2xl font-semibold text-white md:text-3xl">
            Is It Halal or Haram?
          </h2>
        </div>
      </div>

      <div className="border-gold relative w-full max-w-2xl rounded-lg border-4 bg-white bg-opacity-90 p-8 shadow-xl">
        <div className="absolute left-0 top-0 -ml-2 -mt-2 h-12 w-12 rounded-tl-lg border-l-4 border-t-4 border-emerald-700"></div>
        <div className="absolute right-0 top-0 -mr-2 -mt-2 h-12 w-12 rounded-tr-lg border-r-4 border-t-4 border-emerald-700"></div>
        <div className="absolute bottom-0 left-0 -mb-2 -ml-2 h-12 w-12 rounded-bl-lg border-b-4 border-l-4 border-emerald-700"></div>
        <div className="absolute bottom-0 right-0 -mb-2 -mr-2 h-12 w-12 rounded-br-lg border-b-4 border-r-4 border-emerald-700"></div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4 text-slate-700">
            Enter something to check if it is halal or haram according to
            Islamic teachings.
          </div>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your question here..."
              className="w-full rounded-lg border-2 border-emerald-600 bg-emerald-50 p-4 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="mt-4 w-full rounded-lg bg-emerald-700 px-8 py-3 font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50 md:w-auto"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
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
          <div className="mt-6 rounded-lg border-2 border-red-300 bg-red-100 p-4">
            <p className="text-red-700">
              Error: Unable to check ruling at this time. Please try again
              later.
            </p>
          </div>
        )}

        {data && !error && (
          <div
            className={`mt-6 rounded-lg p-6 ${data.isHaram ? "border-2 border-red-300 bg-red-50" : "border-2 border-green-300 bg-green-50"}`}
          >
            <h3
              className={`mb-2 text-2xl font-bold ${data.isHaram ? "text-red-700" : "text-green-700"}`}
            >
              {data.isHaram ? "This is Haram (حرام)" : "This is Halal (حلال)"}
            </h3>
            <p className="text-gray-700">{data.explanation}</p>

            {data.references && (
              <div className="mt-4 border-t border-gray-300 pt-4">
                <p className="text-sm font-semibold">References:</p>
                <ul className="mt-2 list-disc pl-5 text-left text-sm text-gray-600">
                  {data.references.map((ref, index) => (
                    <li key={index}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 w-full max-w-3xl text-sm text-white opacity-75">
        <div className="border-gold border-t-2 pt-4">
          <p>Seek knowledge from authoritative Islamic sources and scholars.</p>
          <p>
            This tool provides guidance based on general Islamic principles, but
            may not account for all nuances or differences between schools of
            thought.
          </p>
        </div>
      </div>
    </div>
  );
}
