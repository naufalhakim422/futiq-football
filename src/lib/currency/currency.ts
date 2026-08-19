export type SupportedCurrency = "USD" | "IDR" | "MYR" | "EUR" | "GBP";

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  rateAgainstUSD: number; // e.g. 1 USD = 16000 IDR
  decimalPlaces: number;
}

export const SUPPORTED_CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    rateAgainstUSD: 1.0,
    decimalPlaces: 2,
  },
  IDR: {
    code: "IDR",
    symbol: "Rp",
    name: "Indonesian Rupiah",
    rateAgainstUSD: 16000,
    decimalPlaces: 0,
  },
  MYR: {
    code: "MYR",
    symbol: "RM",
    name: "Malaysian Ringgit",
    rateAgainstUSD: 4.5,
    decimalPlaces: 2,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    rateAgainstUSD: 0.92,
    decimalPlaces: 2,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    rateAgainstUSD: 0.78,
    decimalPlaces: 2,
  },
};

/**
 * Format standard base USD minor cents (100 = $1.00) into any supported currency
 */
export function formatMoney(
  minorUSD: number,
  targetCurrency: SupportedCurrency = "USD",
  includeCode: boolean = false
): string {
  const config = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.USD;
  const usdAmount = minorUSD / 100;
  const converted = usdAmount * config.rateAgainstUSD;

  let formattedNumber = "";
  if (config.decimalPlaces === 0) {
    formattedNumber = Math.round(converted).toLocaleString("id-ID");
  } else {
    formattedNumber = converted.toLocaleString("en-US", {
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    });
  }

  const prefix = config.symbol === "Rp" ? "Rp " : config.symbol;
  const result = `${prefix}${formattedNumber}`;
  return includeCode ? `${result} ${config.code}` : result;
}

/**
 * Returns a dual currency string (e.g. "$10.00 USD (≈ Rp 160.000)")
 */
export function formatDualCurrency(minorUSD: number, activeCurrency: SupportedCurrency): string {
  const baseUSD = formatMoney(minorUSD, "USD", true);
  if (activeCurrency === "USD") {
    return baseUSD;
  }
  const local = formatMoney(minorUSD, activeCurrency, false);
  return `${local} (≈ ${baseUSD})`;
}
