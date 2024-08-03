"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Simplified import
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
  const [timeRange, setTimeRange] = useState("3m"); // Default to 3 Months

  const fetchTimeSeriesData = useCallback((id: number, range: string) => {
    fetch(`/api/timeseries?id=${id}&timestep=24h`)
      .then((response) => response.json())
      .then((data) => {
        const formattedData = data.data.map((item: any) => ({
          timestamp: item.timestamp,
          avgHighPrice: item.avgHighPrice,
          avgLowPrice: item.avgLowPrice,
        }));
        setTimeSeriesData(filterDataByRange(formattedData, range)); // Filter data
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (name) {
      fetch(`/api/analyze_item?name=${name}`)
        .then((response) => response.json())
        .then((data) => {
          setPriceData(data);
          fetchTimeSeriesData(data.id, timeRange); // Fetch data based on the time range
        })
        .catch((error) => console.error(error));
    }
  }, [name, timeRange, fetchTimeSeriesData]); // Include fetchTimeSeriesData in the dependencies array

  const filterDataByRange = (data: TimeSeriesData[], range: string): TimeSeriesData[] => {
    let numDays;
    if (range === "1y") {
      numDays = 365;
    } else if (range === "6m") {
      numDays = 180;
    } else {
      numDays = 90;
    }
    return data.slice(-numDays); // Get the last `numDays` data points
  };

  if (!name) {
    return <div>Please select an item to analyze.</div>;
  }

  const yAxisMin = Math.floor(Math.min(...timeSeriesData.map((data) => data.avgLowPrice)) * 0.95);
  const yAxisMax = Math.ceil(Math.max(...timeSeriesData.map((data) => data.avgHighPrice)) * 1.05);

  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(3)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    } else {
      return value.toString();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 relative">
      <ModeToggle />
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100 z-10">
        {priceData?.name || "Loading..."}
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
          <div className="w-full flex justify-center my-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px] p-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                <SelectItem
                  value="1y"
                  className="hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white"
                >
                  1 year
                </SelectItem>
                <SelectItem
                  value="6m"
                  className="hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white"
                >
                  6 months
                </SelectItem>
                <SelectItem
                  value="3m"
                  className="hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white"
                >
                  3 months
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                    tickFormatter={(tick) => `${formatNumber(tick)}\u00A0GP`} // Use a non-breaking space
                    width={100} // Increase width to fit longer labels
                    tick={{ dx: -5 }} // Optional: Adjust the position
                    style={{ fontSize: '12px' }} // Optional: Adjust font size for better fit
                  />
                  <Tooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => `${formatNumber(value)}\u00A0GP`} // Use a non-breaking space
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
