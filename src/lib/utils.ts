import { config } from "@/components/config";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { auth } from "@/lib/firebase"; // adjust path

export function getCurrentUser() {
  const user = auth.currentUser;

  if (!user) throw new Error("No user signed in");
  return user;
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type GroupBy<T, K extends keyof T> = Record<string, T[]>;

export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): GroupBy<T, K> {
  return array.reduce((acc, item) => {
    const keyValue = String(item[key]);
    if (!acc[keyValue]) {
      acc[keyValue] = [];
    }
    acc[keyValue].push(item);
    return acc;
  }, {} as GroupBy<T, K>);
}

export function absoluteUrl(path: string) {
  return process.env.NODE_ENV === "development"
    ? `http://localhost:3000${path}`
    : `https://${config.appUrl}${path}`;
}

export function ceilToOneDecimal(value: number) {
  return Math.ceil(value * 10) / 10;
}
