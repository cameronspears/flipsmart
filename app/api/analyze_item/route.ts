// app/api/analyze_item/route.ts

import { NextResponse } from 'next/server';
import { fetchData, getIconUrl } from '@/lib/fetchData';

const LATEST_PRICE_API_URL = 'https://prices.runescape.wiki/api/v1/osrs/latest';
const MAPPING_URL = 'https://prices.runescape.wiki/api/v1/osrs/mapping';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    console.error('Name parameter is missing');
    return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
  }

  try {
    const mappingData = await fetchData(MAPPING_URL);
    const item = mappingData.find((item: any) => item.name === name);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const latestPriceData = await fetchData(`${LATEST_PRICE_API_URL}?id=${item.id}`);
    const priceData = latestPriceData.data[item.id] || {};

    const data = {
      high: priceData.high,
      highTime: priceData.highTime ? new Date(priceData.highTime * 1000).toLocaleString() : null,
      low: priceData.low,
      lowTime: priceData.lowTime ? new Date(priceData.lowTime * 1000).toLocaleString() : null,
      iconUrl: getIconUrl(item.icon),
      name: item.name,
    };

    const response = NextResponse.json(data);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Failed to fetch item analysis data:', error);
    return NextResponse.json({ error: 'Failed to fetch item analysis data' }, { status: 500 });
  }
}
