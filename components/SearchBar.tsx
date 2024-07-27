// components/SearchBar.tsx

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  name: string;
  icon_url: string;
}

const SearchBar: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const resultsRef = useRef<HTMLUListElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery) {
      fetch(`/api/search?query=${debouncedSearchQuery}`)
        .then(response => response.json())
        .then(data => setResults(data.suggestions))
        .catch(error => console.error('Error fetching search results:', error));
    } else {
      setResults([]);
    }
  }, [debouncedSearchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && results.length > 0) {
      setActiveIndex((prevIndex) => (prevIndex + 1) % results.length);
    } else if (event.key === 'ArrowUp' && results.length > 0) {
      setActiveIndex((prevIndex) => (prevIndex === 0 ? results.length - 1 : prevIndex - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      const activeItem = results[activeIndex];
      if (activeItem) {
        setSearchQuery(activeItem.name);
        router.push(`/analyze/${activeItem.name}`);
        setResults([]);
        setActiveIndex(-1);
      }
    }
  };

  const handleItemClick = (name: string) => {
    setSearchQuery(name);
    router.push(`/analyze/${name}`);
    setResults([]);
    setActiveIndex(-1);
  };

  return (
    <div className="relative w-full max-w-md">
      <Input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
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
          className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700"
        >
          {results.map((result, index) => (
            <li
              key={index}
              className={`flex items-center p-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                activeIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
              tabIndex={0}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
              onClick={() => handleItemClick(result.name)}
            >
              <Image
                src={result.icon_url}
                alt={result.name}
                width={24}
                height={24}
                className="mr-2"
              />
              <span className="text-gray-900 dark:text-gray-100">{result.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
