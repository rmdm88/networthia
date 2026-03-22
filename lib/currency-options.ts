export const fiatCurrencyOptions = [
  "RUB",
  "USD",
  "EUR",
  "BYN",
  "GBP",
  "CHF",
  "JPY",
  "CNY",
  "AED",
  "TRY"
] as const;

export const cryptoCurrencyOptions = [
  "BTC",
  "ETH",
  "USDT",
  "USDC",
  "BNB",
  "SOL",
  "TON"
] as const;

export const allCurrencyOptions = [...fiatCurrencyOptions, ...cryptoCurrencyOptions];
