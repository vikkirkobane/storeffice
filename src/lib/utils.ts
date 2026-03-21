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
