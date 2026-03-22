import { NextRequest, NextResponse } from "next/server";

const CRYPTO_SYMBOLS: Record<string, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  BNB: "BNBUSDT",
  SOL: "SOLUSDT",
  TON: "TONUSDT"
};

function toCbrDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function getUnixMs(date: string) {
  return new Date(`${date}T00:00:00.000Z`).getTime();
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
  const response = await fetch(`https://www.cbr.ru/scripts/XML_daily_eng.asp?date_req=${toCbrDate(date)}`, {
    next: { revalidate: 60 * 60 * 12 }
  });

  if (!response.ok) {
    throw new Error("CBR request failed");
  }

  return response.text();
}

async function getBinanceClose(symbol: string, date: string) {
  const startTime = getUnixMs(date);
  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&startTime=${startTime}&limit=1`,
    {
      next: { revalidate: 60 * 60 * 12 }
    }
  );

  if (!response.ok) {
    throw new Error(`Binance request failed for ${symbol}`);
  }

  const payload = (await response.json()) as unknown;
  if (!Array.isArray(payload) || !Array.isArray(payload[0]) || payload[0].length < 5) {
    throw new Error(`No Binance candle for ${symbol}`);
  }

  const close = Number(payload[0][4]);
  if (!Number.isFinite(close) || close <= 0) {
    throw new Error(`Invalid Binance close for ${symbol}`);
  }

  return close;
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

          if (currency in CRYPTO_SYMBOLS) {
            const usdtPrice = await getBinanceClose(CRYPTO_SYMBOLS[currency], date);
            return [currency, { rate: usdtPrice * usdRub, source: "binance+cbr" }] as const;
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
