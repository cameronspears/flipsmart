// app/api/search/route.ts

import { NextResponse } from 'next/server';
import { fetchData, getIconUrl } from '@/lib/fetchData';
import { getCachedData } from '@/lib/cache';
import Fuse from 'fuse.js';

const MAPPING_URL = 'https://prices.runescape.wiki/api/v1/osrs/mapping';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const itemMappingData = await getCachedData(() => fetchData(MAPPING_URL));
    const fuse = new Fuse(itemMappingData, {
      keys: ['name'],
      includeScore: true,
    });
    const matches = fuse.search(query, { limit: 5 });
    const suggestions = matches.map((match: any) => {
      const item = match.item;
      return { name: item.name, icon_url: getIconUrl(item.icon) };
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
  }
}
