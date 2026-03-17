import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Parameters<typeof twMerge>) {
  return twMerge(clsx(inputs));
}
