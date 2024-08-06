"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
} from "@/components/ui/select";
import { ModeToggle } from "@/components/ModeToggle";
import SearchBar from "@/components/SearchBar";

interface PriceData {
  high: number | null;
  highTime: string | null;
  iconUrl: string;
  name: string;
  id: number;
}

interface TimeSeriesData {
  date: string; // Change to string
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
          date: item.date,  // Use date string
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

  // Revert yAxis settings to auto-scale
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

  // Calculate price trend
  const calculatePriceTrend = () => {
    if (timeSeriesData.length < 2) return null;

    const firstPrice = timeSeriesData[0].avgHighPrice;
    const lastPrice = timeSeriesData[timeSeriesData.length - 1].avgHighPrice;

    if (firstPrice === null || lastPrice === null) return null;

    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    return change.toFixed(2); // Return percentage change
  };

  const priceTrend = calculatePriceTrend();

  // Chart configuration
  const chartConfig = {
    avgHighPrice: {
      label: "High Price",
      color: "hsl(var(--chart-1))",
    },
    avgLowPrice: {
      label: "Low Price",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 relative">
      <ModeToggle />
      <Link href="/">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100 z-10 cursor-pointer">
          Flipsmart
        </h1>
      </Link>
      <div className="w-full max-w-md mb-6 z-20">
        <SearchBar />
      </div>
      {priceData ? (
        <div className="text-center w-full max-w-4xl z-10">
          <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
            <CardHeader className="flex items-center justify-between border-b border-gray-300 dark:border-gray-700 py-5 space-y-0 sm:flex-row">
              <div className="flex items-center gap-2">
                <Image
                  src={priceData.iconUrl}
                  alt={priceData.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <CardTitle>{priceData.name}</CardTitle>
                </div>
              </div>
              {/* Time selector positioned at the top right */}
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Select a value">
                  <SelectValue placeholder="Last 3 months" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="3m" className="rounded-lg">
                    Last 3 months
                  </SelectItem>
                  <SelectItem value="6m" className="rounded-lg">
                    Last 6 months
                  </SelectItem>
                  <SelectItem value="1y" className="rounded-lg">
                    Last 1 year
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="fillHighPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="fillLowPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(tick) => {
                        const date = new Date(tick);
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric", // Consistency in formatting
                        });
                      }}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                    />
                    <YAxis
                      domain={[yAxisMin, yAxisMax]}
                      tickFormatter={(tick) => `${formatNumber(tick)}\u00A0GP`}
                      width={100}
                      tick={{ dx: -5 }}
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) => {
                            // Convert date string to a readable date string
                            const date = new Date(value);
                            return date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            });
                          }}
                          indicator="dot"
                        />
                      }
                    />
                    <Area
                      type="natural"
                      dataKey="avgHighPrice"
                      fill="url(#fillHighPrice)"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                    />
                    <Area
                      type="natural"
                      dataKey="avgLowPrice"
                      fill="url(#fillLowPrice)"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 font-medium leading-none">
                    {priceTrend && (
                      <>
                        {parseFloat(priceTrend) >= 0 ? (
                          <span>
                            Trending up by {priceTrend}% this period{" "}
                            <TrendingUp className="h-4 w-4" />
                          </span>
                        ) : (
                          <span>
                            Trending down by {Math.abs(parseFloat(priceTrend))}% this period{" "}
                            <TrendingDown className="h-4 w-4" />
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    Showing data for the last{" "}
                    {timeRange === "3m" ? "3 months" : timeRange === "6m" ? "6 months" : "1 year"}
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
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
