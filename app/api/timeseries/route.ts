// app/api/timeseries/route.ts

import { NextResponse } from "next/server";
import { fetchData } from "@/lib/fetchData";

const TIMESERIES_API_URL = 'https://prices.runescape.wiki/api/v1/osrs/timeseries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const timestep = searchParams.get('timestep') || '24h';

  if (!id) {
    console.error('ID parameter is missing');
    return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
  }

  try {
    const timeSeriesData = await fetchData(`${TIMESERIES_API_URL}?id=${id}&timestep=${timestep}`);

    // Convert timestamps to date strings
    const formattedData = timeSeriesData.data.map((item: any) => ({
      ...item,
      date: new Date(item.timestamp * 1000).toISOString().split('T')[0]  // Convert to YYYY-MM-DD format
    }));

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error('Failed to fetch time series data:', error);
    return NextResponse.json({ error: 'Failed to fetch time series data' }, { status: 500 });
  }
}
