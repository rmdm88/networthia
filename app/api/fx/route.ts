import { NextRequest, NextResponse } from "next/server";

const CRYPTO_SYMBOLS = new Set(["BTC", "ETH", "BNB", "SOL", "TON"]);
const REQUEST_TIMEOUT_MS = 10_000;

function toCbrDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function getUnixMs(date: string) {
  return new Date(`${date}T00:00:00.000Z`).getTime();
}

function getUnixSeconds(date: string) {
  return Math.floor(getUnixMs(date) / 1000);
}

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function parseCbrRate(xml: string, currency: string) {
  if (currency === "RUB") return 1;

  const match = xml.match(
    new RegExp(
      `<CharCode>${currency}</CharCode>[\\s\\S]*?<Nominal>(.*?)</Nominal>[\\s\\S]*?<Value>(.*?)</Value>`,
      "i"
    )
  );

  if (!match) {
    throw new Error(`No CBR rate for ${currency}`);
  }

  const nominal = Number(match[1].replace(",", "."));
  const value = Number(match[2].replace(",", "."));

  if (!Number.isFinite(nominal) || !Number.isFinite(value) || nominal <= 0) {
    throw new Error(`Invalid CBR payload for ${currency}`);
  }

  return value / nominal;
}

async function getCbrXml(date: string) {
  const response = await fetchWithTimeout(`https://www.cbr.ru/scripts/XML_daily_eng.asp?date_req=${toCbrDate(date)}`, {
    next: { revalidate: 60 * 60 * 12 }
  });

  if (!response.ok) {
    throw new Error("CBR request failed");
  }

  return response.text();
}

async function getCryptoCompareRub(symbol: string, date: string) {
  const response = await fetchWithTimeout(
    `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${symbol}&tsyms=RUB&ts=${getUnixSeconds(date)}`,
    {
      next: { revalidate: 60 * 60 * 12 }
    }
  );

  if (!response.ok) {
    throw new Error(`CryptoCompare request failed for ${symbol}`);
  }

  const payload = (await response.json()) as Record<string, { RUB?: number }>;
  const rate = payload[symbol]?.RUB;

  if (!Number.isFinite(rate) || !rate || rate <= 0) {
    throw new Error(`No CryptoCompare RUB rate for ${symbol}`);
  }

  return rate;
}

async function getKuCoinUsdtClose(symbol: string, date: string) {
  const startAt = getUnixSeconds(date);
  const endAt = startAt + 60 * 60 * 24;
  const response = await fetchWithTimeout(
    `https://api.kucoin.com/api/v1/market/candles?type=1day&symbol=${symbol}-USDT&startAt=${startAt}&endAt=${endAt}`,
    {
      next: { revalidate: 60 * 60 * 12 }
    }
  );

  if (!response.ok) {
    throw new Error(`KuCoin request failed for ${symbol}`);
  }

  const payload = (await response.json()) as { code?: string; data?: string[][] };
  const candle = payload.data?.[0];
  const close = Number(candle?.[2]);

  if (payload.code !== "200000" || !Number.isFinite(close) || close <= 0) {
    throw new Error(`No KuCoin candle for ${symbol}`);
  }

  return close;
}

async function getCryptoRubRate(symbol: string, date: string, usdRub: number) {
  try {
    const usdtClose = await getKuCoinUsdtClose(symbol, date);
    return { rate: usdtClose * usdRub, source: "kucoin+cbr" };
  } catch {
    const rate = await getCryptoCompareRub(symbol, date);
    return { rate, source: "cryptocompare" };
  }
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const currenciesParam = request.nextUrl.searchParams.get("currencies");

  if (!date || !currenciesParam) {
    return NextResponse.json({ error: "date and currencies are required" }, { status: 400 });
  }

  const currencies = [...new Set(currenciesParam.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean))];

  try {
    const cbrXml = await getCbrXml(date);
    const usdRub = parseCbrRate(cbrXml, "USD");

    const rateEntries = await Promise.all(
      currencies.map(async (currency) => {
        try {
          if (currency === "RUB") {
            return [currency, { rate: 1, source: "cbr" }] as const;
          }

          if (currency === "USDT" || currency === "USDC") {
            return [currency, { rate: usdRub, source: "cbr-usd-proxy" }] as const;
          }

          if (CRYPTO_SYMBOLS.has(currency)) {
            const cryptoRate = await getCryptoRubRate(currency, date, usdRub);
            return [currency, cryptoRate] as const;
          }

          return [currency, { rate: parseCbrRate(cbrXml, currency), source: "cbr" }] as const;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown FX error";
          return [currency, { error: message }] as const;
        }
      })
    );

    return NextResponse.json({
      date,
      rates: Object.fromEntries(rateEntries)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load FX rates";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
