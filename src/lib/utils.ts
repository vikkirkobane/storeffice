import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Convert snake_case string to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert object keys from snake_case to camelCase (shallow)
 */
export function toCamelCase<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = snakeToCamel(key) as keyof T;
      result[camelKey] = obj[key];
    }
  }
  return result;
}

/**
 * Convert array of objects to camelCase
 */
export function toCamelCaseArray<T extends Record<string, any>>(arr: T[]): T[] {
  return arr.map(item => toCamelCase(item));
}

/**
 * Merge Tailwind CSS classes with proper deduplication
 * Combines clsx for conditional classes and tailwind-merge for conflict resolution
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
// Force rebuild Sun Mar 22 07:01:25 +08 2026
