import { DUAS_API_BASE_URL, QURAN_API_KEY } from '../constants/config';
import type { Dua, DuaCategory } from '../types/dua';

function extractArray<T>(data: unknown, keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    for (const key of keys) {
      const value = (data as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
}

export async function fetchDuaCategories(): Promise<DuaCategory[]> {
  const url = `${DUAS_API_BASE_URL}/categories?apikey=${QURAN_API_KEY}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json = await response.json();
  const categories = extractArray<DuaCategory>(json.data, ['categories', 'items', 'list']);

  if (!json.success || categories.length === 0) {
    throw new Error('Unexpected API response');
  }

  return categories.map((c) => ({ id: c.id, name: c.name, count: c.count }));
}

export async function fetchDuasByCategory(categoryId: string): Promise<Dua[]> {
  const url = `${DUAS_API_BASE_URL}/category/${encodeURIComponent(categoryId)}?apikey=${QURAN_API_KEY}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json = await response.json();
  const duas = extractArray<Dua>(json.data, ['duas', 'items', 'list']);

  if (!json.success) {
    throw new Error('Unexpected API response');
  }

  return duas;
}
