// lib/fetchData.ts

const HEADERS = {
    'User-Agent': 'flipsmart - crspears@outlook.com',
};

export async function fetchData(url: string): Promise<any> {
    const response = await fetch(url, {
        headers: HEADERS,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
    }

    return response.json();
}

export function getIconUrl(iconFileName: string): string {
    const ICON_BASE_URL = "https://oldschool.runescape.wiki/images/";
    return ICON_BASE_URL + iconFileName.replace(/ /g, "_").replace(/\(/g, "%28").replace(/\)/g, "%29");
}
