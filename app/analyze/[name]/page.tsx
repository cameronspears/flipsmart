// app/analyze/[name]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ModeToggle } from "@/components/ModeToggle";

interface PriceData {
  high: number | null;
  highTime: string | null;
  iconUrl: string;
  name: string;
  id: number;
}

interface TimeSeriesData {
  timestamp: number;
  avgHighPrice: number;
  avgLowPrice: number;
}

const AnalyzePage: React.FC = () => {
  const params = useParams();
  const { name } = params;
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);

  useEffect(() => {
    if (name) {
      fetch(`/api/analyze_item?name=${name}`)
        .then((response) => response.json())
        .then((data) => {
          setPriceData(data);
          return fetch(`/api/timeseries?id=${data.id}&timestep=24h`);
        })
        .then((response) => response.json())
        .then((data) => {
          const formattedData = data.data.map((item: any) => ({
            timestamp: item.timestamp,
            avgHighPrice: item.avgHighPrice,
            avgLowPrice: item.avgLowPrice,
          }));
          setTimeSeriesData(applyMovingAverage(formattedData, 5)); // Apply smoothing
        })
        .catch((error) => console.error(error));
    }
  }, [name]);

  if (!name) {
    return <div>Please select an item to analyze.</div>;
  }

  const yAxisMin = Math.floor(Math.min(...timeSeriesData.map((data) => data.avgLowPrice)) * 0.95);
  const yAxisMax = Math.ceil(Math.max(...timeSeriesData.map((data) => data.avgHighPrice)) * 1.05);

  const formatPrice = (price: number | null) => {
    if (price === null) return "N/A";
    return `${Math.round(price)} GP`;
  };

  // Apply a simple moving average to smooth the data
  function applyMovingAverage(data: TimeSeriesData[], windowSize: number): TimeSeriesData[] {
    return data.map((value, index, array) => {
      const start = Math.max(0, index - Math.floor(windowSize / 2));
      const end = Math.min(array.length, index + Math.ceil(windowSize / 2));
      const slice = array.slice(start, end);
      const avgHighPrice = slice.reduce((acc, val) => acc + (val.avgHighPrice || 0), 0) / slice.length;
      const avgLowPrice = slice.reduce((acc, val) => acc + (val.avgLowPrice || 0), 0) / slice.length;
      return { ...value, avgHighPrice, avgLowPrice };
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 relative">
      <ModeToggle />
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100 z-10">
        Flipsmart
      </h1>
      <div className="w-full max-w-md mb-6 z-20">
        <SearchBar />
      </div>
      {priceData ? (
        <div className="text-center w-full max-w-4xl z-10">
          <div className="flex items-center justify-center mb-4">
            <Image
              src={priceData.iconUrl}
              alt={priceData.name}
              className="mr-2"
              width={24}
              height={24}
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {priceData.name}
            </h2>
          </div>
          <p className="text-lg text-gray-900 dark:text-gray-100">
            High Price: {formatPrice(priceData.high)}
          </p>
          <p className="text-lg text-gray-900 dark:text-gray-100">
            High Time: {priceData.highTime || "N/A"}
          </p>
          {timeSeriesData.length > 0 && (
            <ChartContainer
              config={{
                avgHighPrice: { color: "#8884d8" },
                avgLowPrice: { color: "#82ca9d" },
              }}
              className="w-full max-w-4xl"
            >
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={timeSeriesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="avgHighPriceGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#8884d8"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#8884d8"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="avgLowPriceGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#82ca9d"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(tick) =>
                      new Date(tick * 1000).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }
                    minTickGap={15}
                  />
                  <YAxis
                    domain={[yAxisMin, yAxisMax]}
                    tickFormatter={(tick) => `${Math.round(tick)} GP`}
                  />
                  <Tooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => formatPrice(value)}
                  />
                  <Area
                    type="natural" // Use a natural spline for smoothing
                    dataKey="avgHighPrice"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#avgHighPriceGradient)"
                  />
                  <Area
                    type="natural" // Use a natural spline for smoothing
                    dataKey="avgLowPrice"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#avgLowPriceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      ) : (
        <p className="text-lg text-gray-900 dark:text-gray-100">
          Loading price data...
        </p>
      )}
    </div>
  );
};

export default AnalyzePage;
