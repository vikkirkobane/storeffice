/**
 * Utility to convert snake_case keys to camelCase
 * Use when returning DB data to frontend that expects camelCase
 */
export function toCamelCase<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item)) as T;
  }

  const camelObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelObj[camelKey] = toCamelCase((obj as any)[key]);
    }
  }
  return camelObj;
}

/**
 * Convert array of DB objects to camelCase
 */
export function toCamelCaseArray<T>(arr: T[]): T[] {
  return arr.map(item => toCamelCase(item));
}
