import { DEFAULT_TAGS, LegacyAppData } from "@/lib/tags";

export const seedData: LegacyAppData = {
  folders: DEFAULT_TAGS,
  accounts: [
    {
      id: "demo-main-card",
      name: "Основная карта",
      currency: "RUB",
      folderIds: ["liquid", "bank"],
      isActive: true
    },
    {
      id: "demo-invest",
      name: "Инвест-портфель",
      currency: "RUB",
      folderIds: ["invest", "brokerage", "longterm"],
      isActive: true
    },
    {
      id: "demo-cash-usd",
      name: "Наличные USD",
      currency: "USD",
      folderIds: ["liquid", "foreign", "cash"],
      isActive: true
    }
  ],
  snapshots: [
    {
      id: "demo-snap-1",
      date: "2026-01-05",
      entries: [
        { accountId: "demo-main-card", amount: 120000, fxRateToRub: 1 },
        { accountId: "demo-invest", amount: 780000, fxRateToRub: 1 },
        { accountId: "demo-cash-usd", amount: 2000, fxRateToRub: 102.4 }
      ]
    },
    {
      id: "demo-snap-2",
      date: "2026-01-25",
      entries: [
        { accountId: "demo-main-card", amount: 105000, fxRateToRub: 1 },
        { accountId: "demo-invest", amount: 812000, fxRateToRub: 1 },
        { accountId: "demo-cash-usd", amount: 2100, fxRateToRub: 101.8 }
      ]
    },
    {
      id: "demo-snap-3",
      date: "2026-02-15",
      entries: [
        { accountId: "demo-main-card", amount: 138000, fxRateToRub: 1 },
        { accountId: "demo-invest", amount: 846000, fxRateToRub: 1 },
        { accountId: "demo-cash-usd", amount: 1950, fxRateToRub: 100.9 }
      ]
    },
    {
      id: "demo-snap-4",
      date: "2026-03-10",
      entries: [
        { accountId: "demo-main-card", amount: 126000, fxRateToRub: 1 },
        { accountId: "demo-invest", amount: 889000, fxRateToRub: 1 },
        { accountId: "demo-cash-usd", amount: 2050, fxRateToRub: 99.7 }
      ]
    }
  ],
  digestSources: [],
  digestPosts: []
};
