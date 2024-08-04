// lib/cache.ts

let cache: any = null;

export async function getCachedData(fetchDataFunction: () => Promise<any>): Promise<any> {
    if (!cache) {
        cache = await fetchDataFunction();
    }
    return cache;
}
