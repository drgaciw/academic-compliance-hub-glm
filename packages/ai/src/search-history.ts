export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  resultCount?: number;
  hasAnswer?: boolean;
}

export class SearchHistoryManager {
  private static readonly STORAGE_KEY = "aah_search_history";
  private static readonly MAX_HISTORY_ITEMS = 50;

  static getHistory(): SearchHistoryItem[] {
    try {
      if (typeof window === "undefined") return [];

      const stored = (window as any).localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load search history:", error);
      return [];
    }
  }

  static addToHistory(item: SearchHistoryItem): void {
    try {
      if (typeof window === "undefined") return;

      const history = this.getHistory();
      const newItem = {
        ...item,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      const updatedHistory = [newItem, ...history].slice(
        0,
        this.MAX_HISTORY_ITEMS,
      );
      (window as any).localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(updatedHistory),
      );
    } catch (error) {
      console.error("Failed to add to search history:", error);
    }
  }

  static clearHistory(): void {
    try {
      if (typeof window === "undefined") return;

      (window as any).localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  }

  static removeFromHistory(id: string): void {
    try {
      if (typeof window === "undefined") return;

      const history = this.getHistory();
      const filtered = history.filter((item) => item.id !== id);
      (window as any).localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(filtered),
      );
    } catch (error) {
      console.error("Failed to remove from search history:", error);
    }
  }

  static searchHistory(searchTerm: string): SearchHistoryItem[] {
    const history = this.getHistory();
    const term = searchTerm.toLowerCase();

    return history.filter((item) => item.query.toLowerCase().includes(term));
  }
}

export function createSearchHistoryItem(
  query: string,
  resultCount?: number,
  hasAnswer?: boolean,
): SearchHistoryItem {
  return {
    id: crypto.randomUUID(),
    query,
    timestamp: Date.now(),
    resultCount,
    hasAnswer,
  };
}
