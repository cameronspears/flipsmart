// app/analyze/[name]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image"; // Import Image component
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
import { ModeToggle } from "@/components/ModeToggle"; // Import ModeToggle

interface PriceData {
  high: number | null;
  highTime: string | null;
  iconUrl: string;
  name: string;
  id: number; // Include the ID in the price data
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
          // Ensure the data is in the correct format for the chart
          const formattedData = data.data.map((item: any) => ({
            timestamp: item.timestamp,
            avgHighPrice: item.avgHighPrice,
            avgLowPrice: item.avgLowPrice,
          }));
          setTimeSeriesData(formattedData);
        })
        .catch((error) => console.error(error));
    }
  }, [name]);

  if (!name) {
    return <div>Please select an item to analyze.</div>;
  }

  // Calculate min and max values for Y axis
  const yAxisMin =
    Math.min(...timeSeriesData.map((data) => data.avgLowPrice)) * 0.95;
  const yAxisMax =
    Math.max(...timeSeriesData.map((data) => data.avgHighPrice)) * 1.05;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 relative">
      <ModeToggle /> {/* Add ModeToggle component */}
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
              width={24} // Set appropriate width
              height={24} // Set appropriate height
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {priceData.name}
            </h2>
          </div>
          <p className="text-lg text-gray-900 dark:text-gray-100">
            High Price: {priceData.high !== null ? priceData.high : "N/A"}
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
                    minTickGap={15} // Add minTickGap to improve spacing
                  />
                  <YAxis domain={[yAxisMin, yAxisMax]} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="avgHighPrice"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#avgHighPriceGradient)"
                  />
                  <Area
                    type="monotone"
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
