import api from './axios';

let cachedMaterials = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes client cache

/**
 * Retrieves the materials catalog with client-side memory caching.
 * Prevents redundant HTTP roundtrips when navigating between forms and dashboards.
 */
export const getMaterials = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && cachedMaterials && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedMaterials;
  }
  const res = await api.get('/materials');
  cachedMaterials = res.data;
  cacheTimestamp = now;
  return cachedMaterials;
};

/**
 * Invalidates the client-side materials cache.
 * Call after creating, editing, deleting, or importing materials in the Admin Console.
 */
export const invalidateMaterialsCache = () => {
  cachedMaterials = null;
  cacheTimestamp = 0;
};
