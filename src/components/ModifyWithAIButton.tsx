"use client";

import { useState, useMemo } from "react";
import { useModify, useList, useEnable, useDisable } from "modifywithai/react";

function StatusDot({ status }: { status: "success" | "pending" | "error" }) {
  const colors = {
    success: "bg-green-500",
    pending: "bg-yellow-500",
    error: "bg-red-500",
  };
  return (
    <span
      className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${colors[status]}`}
      title={status}
    />
  );
}

export function ModifyWithAIButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { modify, isPending } = useModify();
  const { data: modifications = [], isLoading: isLoadingList } = useList();
  const { enable } = useEnable();
  const { disable } = useDisable();

  const sortedModifications = useMemo(() => {
    return [...modifications].sort((a, b) => {
      if (a.enabled && !b.enabled) return -1;
      if (!a.enabled && b.enabled) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [modifications]);

  const filteredModifications = useMemo(() => {
    if (!searchQuery.trim()) return sortedModifications;
    const query = searchQuery.toLowerCase();
    return sortedModifications.filter((mod) =>
      mod.title?.toLowerCase().includes(query),
    );
  }, [sortedModifications, searchQuery]);

  const displayedModifications = showAll
    ? filteredModifications
    : sortedModifications.slice(0, 3);

  const hasMoreThanThree = sortedModifications.length > 3;

  const handleSubmit = () => {
    if (!prompt.trim()) return;

    modify(prompt, {
      onSuccess: () => {
        setPrompt("");
        setIsOpen(false);
      },
      onError: (error) => {
        console.error(error);
      },
    });
  };

  const handleToggleModification = (mod: (typeof modifications)[0]) => {
    if (mod.enabled) {
      disable(mod.id);
    } else {
      enable(mod.id);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowAll(false);
    setSearchQuery("");
    setPrompt("");
  };

  const handleBackToDefault = () => {
    setShowAll(false);
    setSearchQuery("");
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border-2 border-amber-400/50 bg-emerald-800/95 px-5 py-2.5 font-medium text-amber-100 shadow-lg backdrop-blur-sm transition-all hover:border-amber-400 hover:bg-emerald-700 hover:shadow-xl"
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Modify With AI
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 z-50 cursor-default bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-emerald-700 bg-emerald-900 p-6 shadow-2xl">
        {showAll ? (
          <>
            <div className="mb-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleBackToDefault}
                className="flex items-center gap-1 text-sm text-amber-200 transition-colors hover:text-amber-100"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
              <h3 className="text-lg font-semibold text-white">
                All Modifications
              </h3>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modifications..."
              className="mb-4 w-full rounded-lg border-2 border-emerald-600 bg-emerald-800 px-4 py-2.5 text-white placeholder-emerald-400 focus:border-amber-400 focus:outline-none"
            />

            <div className="max-h-64 space-y-2 overflow-y-auto">
              {isLoadingList ? (
                <p className="py-4 text-center text-emerald-300">Loading...</p>
              ) : filteredModifications.length === 0 ? (
                <p className="py-4 text-center text-emerald-300">
                  No modifications found
                </p>
              ) : (
                filteredModifications.map((mod) => (
                  <div
                    key={mod.id}
                    className="flex items-center gap-3 rounded-lg bg-emerald-800/50 p-3"
                  >
                    <StatusDot status={mod.status} />
                    <span className="flex-1 truncate text-sm text-white">
                      {mod.title ?? "Untitled modification"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleModification(mod)}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                        mod.enabled
                          ? "bg-red-600/80 text-white hover:bg-red-600"
                          : "bg-emerald-600 text-white hover:bg-emerald-500"
                      }`}
                    >
                      {mod.enabled ? "Disable" : "Enable"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Modify With AI
            </h3>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the changes you want to make..."
              disabled={isPending}
              className="mb-4 h-28 w-full resize-none rounded-lg border-2 border-emerald-600 bg-emerald-800 px-4 py-3 text-white placeholder-emerald-400 focus:border-amber-400 focus:outline-none disabled:opacity-50"
            />

            <div className="mb-4 flex gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !prompt.trim()}
                className="flex-1 rounded-lg bg-amber-500 py-2.5 font-medium text-emerald-900 transition-colors hover:bg-amber-400 disabled:opacity-50"
              >
                {isPending ? "Submitting..." : "Submit"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="rounded-lg border-2 border-emerald-600 px-4 py-2.5 font-medium text-emerald-200 transition-colors hover:border-emerald-500 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            {sortedModifications.length > 0 && (
              <div className="border-t border-emerald-700 pt-4">
                <h4 className="mb-3 text-sm font-medium text-emerald-300">
                  Recent Modifications
                </h4>
                <div className="space-y-2">
                  {displayedModifications.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex items-center gap-3 rounded-lg bg-emerald-800/50 p-3"
                    >
                      <StatusDot status={mod.status} />
                      <span className="flex-1 truncate text-sm text-white">
                        {mod.title ?? "Untitled modification"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleModification(mod)}
                        className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                          mod.enabled
                            ? "bg-red-600/80 text-white hover:bg-red-600"
                            : "bg-emerald-600 text-white hover:bg-emerald-500"
                        }`}
                      >
                        {mod.enabled ? "Disable" : "Enable"}
                      </button>
                    </div>
                  ))}
                </div>

                {hasMoreThanThree && (
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="mt-3 w-full rounded-lg border border-dashed border-emerald-600 py-2 text-sm text-emerald-300 transition-colors hover:border-emerald-500 hover:text-emerald-200"
                  >
                    Show all ({sortedModifications.length})
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
