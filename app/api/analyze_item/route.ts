// app/api/analyze_item/route.ts

import {NextResponse} from 'next/server';
import {fetchData, getIconUrl} from '@/lib/fetchData';

const MAPPING_URL = 'https://prices.runescape.wiki/api/v1/osrs/mapping';

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
        console.error('Name parameter is missing');
        return NextResponse.json({error: 'Name parameter is required'}, {status: 400});
    }

    try {
        const mappingData = await fetchData(MAPPING_URL);
        const item = mappingData.find((item: any) => item.name === name);

        if (!item) {
            return NextResponse.json({error: 'Item not found'}, {status: 404});
        }


        const data = {
            id: item.id, // Include the ID here
            iconUrl: getIconUrl(item.icon),
            name: item.name,
        };

        const response = NextResponse.json(data);
        response.headers.set('Cache-Control', 'no-store');
        return response;
    } catch (error) {
        console.error('Failed to fetch item analysis data:', error);
        return NextResponse.json({error: 'Failed to fetch item analysis data'}, {status: 500});
    }
}
