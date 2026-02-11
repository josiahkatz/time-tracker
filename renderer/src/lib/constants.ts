import type { CategoryItem } from './types';

export function colorMap(items: CategoryItem[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of items) {
    map[item.name] = item.color;
  }
  return map;
}
