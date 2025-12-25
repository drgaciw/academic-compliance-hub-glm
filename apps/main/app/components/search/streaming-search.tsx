"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Clock, ExternalLink, Loader2 } from "lucide-react";
import {
  SearchHistoryManager,
  createSearchHistoryItem,
  type SearchHistoryItem,
} from "@aah/ai";

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
  content: string;
  metadata?: Record<string, any>;
}

interface SourceCitation {
  url: string;
  title: string;
  excerpt: string;
}

interface StreamingSearchProps {
  className?: string;
}

export function StreamingSearch({ className }: StreamingSearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<SourceCitation[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchHistory(SearchHistoryManager.getHistory());
  }, []);

  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer]);

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch("/api/search/pagefind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      setSearchResults(data.results || []);

      if (data.results && data.results.length > 0) {
        await streamAIAnswer(searchQuery, data.results);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const streamAIAnswer = async (
    searchQuery: string,
    results: SearchResult[],
  ) => {
    setIsStreaming(true);
    setAnswer("");
    setCitations([]);

    try {
      const response = await fetch("/api/search/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, searchResults: results }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.chunk) {
                setAnswer((prev) => prev + data.chunk);
              }

              if (data.done && data.citations) {
                setCitations(data.citations);
              }

              if (data.error) {
                console.error("Stream error:", data.error);
              }
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }
      }

      const historyItem = createSearchHistoryItem(
        searchQuery,
        results.length,
        true,
      );
      SearchHistoryManager.addToHistory(historyItem);
      setSearchHistory(SearchHistoryManager.getHistory());
    } catch (error) {
      console.error("AI streaming error:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    performSearch(query.trim());
    setShowHistory(false);
  };

  const handleHistoryClick = (item: SearchHistoryItem) => {
    setQuery(item.query);
    performSearch(item.query);
    setShowHistory(false);
  };

  const handleClearHistory = () => {
    SearchHistoryManager.clearHistory();
    setSearchHistory([]);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowHistory(true)}
          placeholder="Search documentation..."
          className="w-full px-4 py-3 pl-12 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setAnswer("");
              setSearchResults([]);
              setCitations([]);
            }}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <button
          type="submit"
          disabled={!query.trim() || isSearching || isStreaming}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          {isSearching || isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Search"
          )}
        </button>

        {showHistory && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent searches
              </span>
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear all
              </button>
            </div>
            <ul className="max-h-60 overflow-y-auto">
              {searchHistory.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                  >
                    {item.query}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>

      {searchResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Found {searchResults.length} result
            {searchResults.length !== 1 ? "s" : ""}
          </h3>
          <div className="space-y-2">
            {searchResults.map((result, idx) => (
              <a
                key={idx}
                href={result.url}
                className="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-blue-600 dark:text-blue-400 flex-1">
                    {result.title}
                  </h4>
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {result.excerpt}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}

      {answer && (
        <div className="mt-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">AI Answer</h3>
            <div
              ref={answerRef}
              className="prose dark:prose-invert max-w-none overflow-auto max-h-96"
            >
              {answer}
            </div>

            {isStreaming && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </div>
            )}

            {citations.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Sources
                </h4>
                <ul className="space-y-2">
                  {citations.map((citation, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        [{idx + 1}]
                      </span>
                      <div className="flex-1">
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {citation.title}
                        </a>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {citation.excerpt}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
