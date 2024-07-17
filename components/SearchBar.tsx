// components/SearchBar.tsx

"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  name: string;
  icon_url: string;
}

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
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
  };

  return (
    <div className="relative w-full max-w-md">
      <Input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search..."
        className="w-full p-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />
      {results.length > 0 && (
        <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
          {results.map((result, index) => (
            <li key={index} className="flex items-center p-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
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
