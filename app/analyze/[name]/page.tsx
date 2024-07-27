// app/analyze/[name]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';

interface PriceData {
  high: number | null;
  highTime: string | null;
  low: number | null;
  lowTime: string | null;
  iconUrl: string;
  name: string;
}

const AnalyzePage: React.FC = () => {
  const params = useParams();
  const { name } = params;
  const [priceData, setPriceData] = useState<PriceData | null>(null);

  useEffect(() => {
    if (name) {
      fetch(`/api/analyze_item?name=${name}`)
        .then((response) => response.json())
        .then((data) => setPriceData(data))
        .catch((error) => console.error(error));
    }
  }, [name]);

  if (!name) {
    return <div>Please select an item to analyze.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">Flipsmart</h1>
      <div className="w-full max-w-md mb-6">
        <SearchBar />
      </div>
      {priceData ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Item Name: {priceData.name}</h2>
          <img src={priceData.iconUrl} alt={priceData.name} className="mx-auto mb-4" />
          <p className="text-lg text-gray-900 dark:text-gray-100">High Price: {priceData.high !== null ? priceData.high : 'N/A'}</p>
          <p className="text-lg text-gray-900 dark:text-gray-100">High Time: {priceData.highTime || 'N/A'}</p>
          <p className="text-lg text-gray-900 dark:text-gray-100">Low Price: {priceData.low !== null ? priceData.low : 'N/A'}</p>
          <p className="text-lg text-gray-900 dark:text-gray-100">Low Time: {priceData.lowTime || 'N/A'}</p>
        </div>
      ) : (
        <p className="text-lg text-gray-900 dark:text-gray-100">Loading price data...</p>
      )}
    </div>
  );
};

export default AnalyzePage;
