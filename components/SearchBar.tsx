"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  name: string;
  icon_url: string;
}

const SearchBar: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const resultsRef = useRef<HTMLUListElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery) {
      fetch(`/api/search?query=${debouncedSearchQuery}`)
        .then((response) => response.json())
        .then((data) => setResults(data.suggestions || []))
        .catch((error) => {
          console.error("Error fetching search results:", error);
          setResults([]);
        });
    } else {
      setResults([]);
    }
  }, [debouncedSearchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleItemClick = (name: string) => {
    setSearchQuery(name);
    router.push(`/analyze/${name}`);
    setResults([]);
  };

  return (
    <div className="relative w-full max-w-md z-50">
      <Input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search..."
        className="w-full p-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        aria-autocomplete="list"
        aria-controls="search-results"
        aria-expanded={results.length > 0}
      />
      {results.length > 0 && (
        <ul
          id="search-results"
          ref={resultsRef}
          className="absolute left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50"
          style={{ opacity: 0.9 }}
        >
          {results.map((result, index) => (
            <li
              key={index}
              className="flex items-center p-2 border-b border-gray-700 last:border-b-0"
              onClick={() => handleItemClick(result.name)}
              style={{ height: "45px" }}
            >
              <div
                className="mr-2 flex-shrink-0"
                style={{ width: "35px", height: "35px" }}
              >
                <Image
                  src={result.icon_url}
                  alt={result.name}
                  width={35}
                  height={35}
                  className="object-contain h-full w-full"
                />
              </div>
              <span className="text-gray-100">{result.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
