"use client";

import { useState, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@aah/ui";
import { cn } from "@aah/ui";

export interface Institution {
  id: string;
  name: string;
  city: string;
  state: string;
  country?: string;
}

interface InstitutionSearchProps {
  institutions: Institution[];
  onSelect: (institution: Institution) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

export function InstitutionSearch({
  institutions,
  onSelect,
  placeholder = "Search institutions...",
  className,
  isLoading = false,
}: InstitutionSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredInstitutions = useMemo(() => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return institutions.filter(
      (inst) =>
        inst.name.toLowerCase().includes(lowerQuery) ||
        inst.city.toLowerCase().includes(lowerQuery) ||
        inst.state.toLowerCase().includes(lowerQuery),
    );
  }, [query, institutions]);

  const handleSelect = (institution: Institution) => {
    onSelect(institution);
    setQuery("");
    setIsOpen(false);
  };

  const handleBlur = (e: React.FocusEvent) => {
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          className="pl-10"
          aria-expanded={isOpen}
          aria-controls="institution-list"
          aria-autocomplete="list"
        />
        {isLoading && (
          <Loader2
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400"
            aria-hidden="true"
          />
        )}
      </div>

      {isOpen && (query || filteredInstitutions.length > 0) && (
        <ul
          id="institution-list"
          className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
          role="listbox"
        >
          {isLoading ? (
            <li className="px-4 py-3 text-sm text-gray-500">
              Loading institutions...
            </li>
          ) : filteredInstitutions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">
              No institutions found
            </li>
          ) : (
            filteredInstitutions.map((institution) => (
              <li
                key={institution.id}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleSelect(institution)}
                role="option"
              >
                <div className="font-medium text-gray-900">
                  {institution.name}
                </div>
                <div className="text-xs text-gray-500">
                  {institution.city}, {institution.state}
                  {institution.country && `, ${institution.country}`}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
