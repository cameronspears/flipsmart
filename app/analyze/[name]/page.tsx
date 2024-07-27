// app/analyze/[name]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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
    <div>
      <h1>Analyze Item</h1>
      {priceData ? (
        <div>
          <h2>Item Name: {priceData.name}</h2>
          <img src={priceData.iconUrl} alt={priceData.name} />
          <p>High Price: {priceData.high !== null ? priceData.high : 'N/A'}</p>
          <p>High Time: {priceData.highTime || 'N/A'}</p>
          <p>Low Price: {priceData.low !== null ? priceData.low : 'N/A'}</p>
          <p>Low Time: {priceData.lowTime || 'N/A'}</p>
        </div>
      ) : (
        <p>Loading price data...</p>
      )}
    </div>
  );
};

export default AnalyzePage;
