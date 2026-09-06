import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currency?: string | null
): string {
  const numericAmount =
    typeof amount === "string"
      ? parseFloat(amount) || 0
      : typeof amount === "number" && Number.isFinite(amount)
      ? amount
      : 0;
  const resolvedCurrency = currency || process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "NGN";
  const locale = resolvedCurrency === "NGN" ? "en-NG" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: resolvedCurrency,
  }).format(numericAmount);
}

export function getCurrencySymbol(
  currency?: string | null
): string {
  const resolvedCurrency = currency || process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "NGN";
  switch (resolvedCurrency.toUpperCase()) {
    case "NGN":
      return "₦";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    default: {
      try {
        const locale = resolvedCurrency === "NGN" ? "en-NG" : "en-US";
        const parts = new Intl.NumberFormat(locale, {
          style: "currency",
          currency: resolvedCurrency,
        }).formatToParts(0);
        const symbolPart = parts.find((p) => p.type === "currency");
        return symbolPart ? symbolPart.value : resolvedCurrency;
      } catch {
        return resolvedCurrency;
      }
    }
  }
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
