import { DEFAULT_TAGS, LegacyAppData } from "@/lib/tags";

export const seedData: LegacyAppData = {
  folders: DEFAULT_TAGS,
  accounts: [
    {
      id: "black-checking",
      name: "Текущий счет Блэк",
      type: "bank",
      currency: "RUB",
      folderIds: ["liquid"],
      isActive: true
    },
    {
      id: "all-airlines-credit",
      name: "Текущий счет All airlines",
      type: "bank",
      currency: "RUB",
      folderIds: ["debt"],
      isActive: true
    },
    {
      id: "broker-2",
      name: "Брокерский счет 2",
      type: "brokerage",
      currency: "RUB",
      folderIds: ["invest"],
      isActive: true
    },
    {
      id: "reserve-fund",
      name: "Неприкосновенный запас",
      type: "cash",
      currency: "RUB",
      folderIds: ["liquid", "longterm"],
      isActive: true
    },
    {
      id: "apartment",
      name: "Квартира",
      type: "real_estate",
      currency: "RUB",
      folderIds: ["longterm"],
      isActive: true
    },
    {
      id: "broker-1",
      name: "Брокерский счет 1",
      type: "brokerage",
      currency: "RUB",
      folderIds: ["invest"],
      isActive: true
    },
    {
      id: "l2-fund",
      name: "L2 фонд",
      type: "other",
      currency: "RUB",
      folderIds: ["invest", "longterm"],
      isActive: true
    },
    {
      id: "usd-account",
      name: "Иностранная карта",
      type: "bank",
      currency: "BYN",
      folderIds: ["liquid", "foreign"],
      isActive: true
    },
    {
      id: "eur-account",
      name: "Евровый счет",
      type: "bank",
      currency: "EUR",
      folderIds: ["liquid", "foreign"],
      isActive: true
    },
    {
      id: "piggy-bank",
      name: "Копилка",
      type: "cash",
      currency: "RUB",
      folderIds: ["liquid"],
      isActive: true
    },
    {
      id: "status-bank",
      name: "Статус Банк",
      type: "bank",
      currency: "RUB",
      folderIds: ["liquid"],
      isActive: true
    },
    {
      id: "ton",
      name: "TON",
      type: "crypto",
      currency: "TON",
      folderIds: ["invest", "foreign"],
      isActive: true
    },
    {
      id: "usdt",
      name: "USDT",
      type: "crypto",
      currency: "USDT",
      folderIds: ["liquid", "invest", "foreign"],
      isActive: true
    },
    {
      id: "bitcoin",
      name: "Bitcoin",
      type: "crypto",
      currency: "BTC",
      folderIds: ["invest", "longterm", "foreign"],
      isActive: true
    },
    {
      id: "cash-usd",
      name: "Наличные - Доллар",
      type: "cash",
      currency: "USD",
      folderIds: ["liquid", "foreign"],
      isActive: true
    },
    {
      id: "cash-eur",
      name: "Наличные - Евро",
      type: "cash",
      currency: "EUR",
      folderIds: ["liquid", "foreign"],
      isActive: true
    },
    {
      id: "cash-rub",
      name: "Наличные - Рубль",
      type: "cash",
      currency: "RUB",
      folderIds: ["liquid"],
      isActive: true
    }
  ],
  snapshots: [
    {
      id: "snap-1",
      date: "2023-06-27",
      entries: [
        { accountId: "black-checking", amount: 18465, fxRateToRub: 1 },
        { accountId: "all-airlines-credit", amount: -169461, fxRateToRub: 1 },
        { accountId: "reserve-fund", amount: 216913, fxRateToRub: 1 },
        { accountId: "apartment", amount: 362215, fxRateToRub: 1 },
        { accountId: "broker-1", amount: 244999, fxRateToRub: 1 },
        { accountId: "cash-usd", amount: 265512, fxRateToRub: 1 },
        { accountId: "cash-eur", amount: 38661, fxRateToRub: 1 }
      ]
    },
    {
      id: "snap-2",
      date: "2024-12-08",
      entries: [
        { accountId: "black-checking", amount: 16473, fxRateToRub: 1 },
        { accountId: "all-airlines-credit", amount: -13842, fxRateToRub: 1 },
        { accountId: "reserve-fund", amount: 265917, fxRateToRub: 1 },
        { accountId: "apartment", amount: 3451, fxRateToRub: 1 },
        { accountId: "broker-1", amount: 420978, fxRateToRub: 1 },
        { accountId: "usd-account", amount: 7067, fxRateToRub: 1 },
        { accountId: "ton", amount: 29768, fxRateToRub: 1 },
        { accountId: "usdt", amount: 8369, fxRateToRub: 1 },
        { accountId: "bitcoin", amount: 17220, fxRateToRub: 1 },
        { accountId: "cash-usd", amount: 199284, fxRateToRub: 1 },
        { accountId: "cash-eur", amount: 0, fxRateToRub: 1 },
        { accountId: "cash-rub", amount: 20560, fxRateToRub: 1 }
      ]
    },
    {
      id: "snap-3",
      date: "2025-01-09",
      entries: [
        { accountId: "black-checking", amount: 15734, fxRateToRub: 1 },
        { accountId: "all-airlines-credit", amount: -69594, fxRateToRub: 1 },
        { accountId: "reserve-fund", amount: 549424, fxRateToRub: 1 },
        { accountId: "apartment", amount: 3929, fxRateToRub: 1 },
        { accountId: "broker-1", amount: 465529, fxRateToRub: 1 },
        { accountId: "usd-account", amount: 7167, fxRateToRub: 1 },
        { accountId: "ton", amount: 24070, fxRateToRub: 1 },
        { accountId: "usdt", amount: 8705, fxRateToRub: 1 },
        { accountId: "bitcoin", amount: 16737, fxRateToRub: 1 },
        { accountId: "cash-usd", amount: 207283, fxRateToRub: 1 },
        { accountId: "cash-eur", amount: 0, fxRateToRub: 1 },
        { accountId: "cash-rub", amount: 20560, fxRateToRub: 1 }
      ]
    },
    {
      id: "snap-4",
      date: "2025-02-06",
      entries: [
        { accountId: "black-checking", amount: 15734, fxRateToRub: 1 },
        { accountId: "all-airlines-credit", amount: -38438, fxRateToRub: 1 },
        { accountId: "reserve-fund", amount: 627560, fxRateToRub: 1 },
        { accountId: "apartment", amount: 4350, fxRateToRub: 1 },
        { accountId: "broker-1", amount: 445012, fxRateToRub: 1 },
        { accountId: "usd-account", amount: 6781, fxRateToRub: 1 },
        { accountId: "ton", amount: 16887, fxRateToRub: 1 },
        { accountId: "usdt", amount: 8191, fxRateToRub: 1 },
        { accountId: "bitcoin", amount: 16652, fxRateToRub: 1 },
        { accountId: "cash-usd", amount: 194951, fxRateToRub: 1 },
        { accountId: "cash-eur", amount: 0, fxRateToRub: 1 },
        { accountId: "cash-rub", amount: 20560, fxRateToRub: 1 }
      ]
    },
    {
      id: "snap-5",
      date: "2025-03-07",
      entries: [
        { accountId: "black-checking", amount: 12255, fxRateToRub: 1 },
        { accountId: "all-airlines-credit", amount: -26973, fxRateToRub: 1 },
        { accountId: "reserve-fund", amount: 454186, fxRateToRub: 1 },
        { accountId: "apartment", amount: 5630, fxRateToRub: 1 },
        { accountId: "broker-1", amount: 415856, fxRateToRub: 1 },
        { accountId: "usd-account", amount: 6491, fxRateToRub: 1 },
        { accountId: "ton", amount: 12123, fxRateToRub: 1 },
        { accountId: "usdt", amount: 7536, fxRateToRub: 1 },
        { accountId: "bitcoin", amount: 13874, fxRateToRub: 1 },
        { accountId: "cash-usd", amount: 179335, fxRateToRub: 1 },
        { accountId: "cash-eur", amount: 0, fxRateToRub: 1 },
        { accountId: "cash-rub", amount: 20560, fxRateToRub: 1 }
      ]
    },
    {
      id: "snap-6",
      date: "2025-03-22",
      entries: [
        { accountId: "black-checking", amount: 11662, fxRateToRub: 1 },
        { accountId: "all-airlines-credit", amount: 0, fxRateToRub: 1 },
        { accountId: "reserve-fund", amount: 543850, fxRateToRub: 1 },
        { accountId: "apartment", amount: 6067, fxRateToRub: 1 },
        { accountId: "broker-1", amount: 408672, fxRateToRub: 1 },
        { accountId: "usd-account", amount: 6212, fxRateToRub: 1 },
        { accountId: "ton", amount: 13742, fxRateToRub: 1 },
        { accountId: "usdt", amount: 7110, fxRateToRub: 1 },
        { accountId: "bitcoin", amount: 12335, fxRateToRub: 1 },
        { accountId: "cash-usd", amount: 169260, fxRateToRub: 1 },
        { accountId: "cash-eur", amount: 0, fxRateToRub: 1 },
        { accountId: "cash-rub", amount: 560, fxRateToRub: 1 }
      ]
    },
    {
      id: "snap-7",
      date: "2025-04-07",
      entries: [
        { accountId: "black-checking", amount: 11918, fxRateToRub: 1 },
        { accountId: "all-airlines-credit", amount: -63329, fxRateToRub: 1 },
        { accountId: "reserve-fund", amount: 527850, fxRateToRub: 1 },
        { accountId: "apartment", amount: 6788, fxRateToRub: 1 },
        { accountId: "broker-1", amount: 343138, fxRateToRub: 1 },
        { accountId: "usd-account", amount: 6383, fxRateToRub: 1 },
        { accountId: "ton", amount: 11578, fxRateToRub: 1 },
        { accountId: "usdt", amount: 7279, fxRateToRub: 1 },
        { accountId: "bitcoin", amount: 11494, fxRateToRub: 1 },
        { accountId: "cash-usd", amount: 173371, fxRateToRub: 1 },
        { accountId: "cash-eur", amount: 0, fxRateToRub: 1 },
        { accountId: "cash-rub", amount: 560, fxRateToRub: 1 }
      ]
    },
    {
      id: "snap-8",
      date: "2025-05-06",
      entries: [
        { accountId: "black-checking", amount: 240087, fxRateToRub: 1 },
        { accountId: "all-airlines-credit", amount: -103483, fxRateToRub: 1 },
        { accountId: "reserve-fund", amount: 533917, fxRateToRub: 1 },
        { accountId: "apartment", amount: 7937, fxRateToRub: 1 },
        { accountId: "broker-1", amount: 375907, fxRateToRub: 1 },
        { accountId: "usd-account", amount: 6273, fxRateToRub: 1 },
        { accountId: "ton", amount: 10884, fxRateToRub: 1 },
        { accountId: "usdt", amount: 6865, fxRateToRub: 1 },
        { accountId: "bitcoin", amount: 13317, fxRateToRub: 1 },
        { accountId: "cash-usd", amount: 163517, fxRateToRub: 1 },
        { accountId: "cash-eur", amount: 0, fxRateToRub: 1 },
        { accountId: "cash-rub", amount: 560, fxRateToRub: 1 }
      ]
    },
    {
      id: "snap-9",
      date: "2025-06-05",
      entries: [
        { accountId: "black-checking", amount: 39567, fxRateToRub: 1 },
        { accountId: "all-airlines-credit", amount: -56907, fxRateToRub: 1 },
        { accountId: "reserve-fund", amount: 819541, fxRateToRub: 1 },
        { accountId: "apartment", amount: 9722, fxRateToRub: 1 },
        { accountId: "broker-1", amount: 405257, fxRateToRub: 1 },
        { accountId: "usd-account", amount: 6128, fxRateToRub: 1 },
        { accountId: "ton", amount: 11523, fxRateToRub: 1 },
        { accountId: "usdt", amount: 6715, fxRateToRub: 1 },
        { accountId: "bitcoin", amount: 14516, fxRateToRub: 1 },
        { accountId: "cash-usd", amount: 159769, fxRateToRub: 1 },
        { accountId: "cash-eur", amount: 0, fxRateToRub: 1 },
        { accountId: "cash-rub", amount: 560, fxRateToRub: 1 }
      ]
    },
    {
      id: "snap-10",
      date: "2025-07-09",
      entries: [
        { accountId: "black-checking", amount: 6986, fxRateToRub: 1 },
        { accountId: "all-airlines-credit", amount: -71521, fxRateToRub: 1 },
        { accountId: "reserve-fund", amount: 1000499, fxRateToRub: 1 },
        { accountId: "apartment", amount: 10170, fxRateToRub: 1 },
        { accountId: "broker-1", amount: 422035, fxRateToRub: 1 },
        { accountId: "ton", amount: 9867, fxRateToRub: 1 },
        { accountId: "usdt", amount: 6625, fxRateToRub: 1 },
        { accountId: "bitcoin", amount: 14872, fxRateToRub: 1 },
        { accountId: "cash-usd", amount: 157654, fxRateToRub: 1 },
        { accountId: "cash-rub", amount: 560, fxRateToRub: 1 }
      ]
    },
    {
      id: "snap-11",
      date: "2025-08-22",
      entries: [
        { accountId: "black-checking", amount: 14801, fxRateToRub: 1 },
        { accountId: "all-airlines-credit", amount: -59674, fxRateToRub: 1 },
        { accountId: "reserve-fund", amount: 1001763, fxRateToRub: 1 },
        { accountId: "apartment", amount: 201865, fxRateToRub: 1 },
        { accountId: "broker-1", amount: 463672, fxRateToRub: 1 },
        { accountId: "ton", amount: 11810, fxRateToRub: 1 },
        { accountId: "usdt", amount: 6834, fxRateToRub: 1 },
        { accountId: "bitcoin", amount: 15876, fxRateToRub: 1 },
        { accountId: "cash-usd", amount: 162691, fxRateToRub: 1 },
        { accountId: "cash-rub", amount: 560, fxRateToRub: 1 }
      ]
    },
    {
      id: "snap-12",
      date: "2025-09-10",
      entries: [
        { accountId: "black-checking", amount: 16748, fxRateToRub: 1 },
        { accountId: "all-airlines-credit", amount: -102417, fxRateToRub: 1 },
        { accountId: "reserve-fund", amount: 967963, fxRateToRub: 1 },
        { accountId: "apartment", amount: 203340, fxRateToRub: 1 },
        { accountId: "broker-1", amount: 476841, fxRateToRub: 1 },
        { accountId: "usd-account", amount: 5828, fxRateToRub: 1 },
        { accountId: "ton", amount: 11820, fxRateToRub: 1 },
        { accountId: "usdt", amount: 7156, fxRateToRub: 1 },
        { accountId: "bitcoin", amount: 16559, fxRateToRub: 1 },
        { accountId: "cash-usd", amount: 170529, fxRateToRub: 1 },
        { accountId: "cash-rub", amount: 560, fxRateToRub: 1 }
      ]
    },
    {
      id: "snap-13",
      date: "2025-10-07",
      entries: [
        { accountId: "black-checking", amount: 4476, fxRateToRub: 1 },
        { accountId: "all-airlines-credit", amount: -190015, fxRateToRub: 1 },
        { accountId: "reserve-fund", amount: 634010, fxRateToRub: 1 },
        { accountId: "apartment", amount: 507172, fxRateToRub: 1 },
        { accountId: "broker-1", amount: 489423, fxRateToRub: 1 },
        { accountId: "usd-account", amount: 28498, fxRateToRub: 1 },
        { accountId: "ton", amount: 10501, fxRateToRub: 1 },
        { accountId: "usdt", amount: 6965, fxRateToRub: 1 },
        { accountId: "bitcoin", amount: 17782, fxRateToRub: 1 },
        { accountId: "cash-usd", amount: 165835, fxRateToRub: 1 },
        { accountId: "cash-rub", amount: 560, fxRateToRub: 1 }
      ]
    },
    {
      id: "snap-14",
      date: "2026-02-09",
      entries: [
        { accountId: "black-checking", amount: 29905, fxRateToRub: 1 },
        { accountId: "all-airlines-credit", amount: -139758, fxRateToRub: 1 },
        { accountId: "reserve-fund", amount: 549349, fxRateToRub: 1 },
        { accountId: "apartment", amount: 8527, fxRateToRub: 1 },
        { accountId: "broker-1", amount: 455844, fxRateToRub: 1 },
        { accountId: "usd-account", amount: 32581, fxRateToRub: 1 },
        { accountId: "ton", amount: 4672, fxRateToRub: 1 },
        { accountId: "usdt", amount: 6544, fxRateToRub: 1 },
        { accountId: "bitcoin", amount: 9280, fxRateToRub: 1 },
        { accountId: "cash-usd", amount: 156163, fxRateToRub: 1 },
        { accountId: "cash-eur", amount: 0, fxRateToRub: 1 },
        { accountId: "cash-rub", amount: 60, fxRateToRub: 1 }
      ]
    }
  ],
  digestSources: [
    { id: "src-1", name: "The Generalist", folderIds: ["invest"] },
    { id: "src-2", name: "Finshots", folderIds: ["invest", "foreign"] },
    { id: "src-3", name: "Bankless", folderIds: ["invest", "foreign"] }
  ],
  digestPosts: [
    {
      id: "post-1",
      sourceId: "src-1",
      title: "A calmer market still rewards disciplined allocation",
      summary: "Why steady rebalance beats trying to predict every move.",
      publishedAt: "2026-03-03T07:30:00.000Z",
      tag: "markets"
    },
    {
      id: "post-2",
      sourceId: "src-2",
      title: "Morning macro: oil, rates and ruble pressure",
      summary: "A short scan of variables that matter for a RUB-based household balance sheet.",
      publishedAt: "2026-03-03T05:50:00.000Z",
      tag: "macro"
    },
    {
      id: "post-3",
      sourceId: "src-3",
      title: "What stablecoin yields are actually compensating you for",
      summary: "Separating protocol risk, venue risk and FX assumptions.",
      publishedAt: "2026-03-03T10:10:00.000Z",
      tag: "crypto"
    }
  ]
};
