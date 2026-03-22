import { Account, AppData, Snapshot, SnapshotEntry } from "@/lib/types";
import { getAccountTagIds } from "@/lib/tags";

export const formatCurrency = (value: number, currency = "RUB") =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "RUB" ? 0 : 2
  }).format(value);

export const formatCompactRub = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);

export const entryValueRub = (entry: SnapshotEntry) => entry.amount * entry.fxRateToRub;

export const getSortedSnapshots = (snapshots: Snapshot[]) =>
  [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

export const getLatestSnapshot = (data: AppData) => getSortedSnapshots(data.snapshots).at(-1) ?? null;

export const getPreviousSnapshot = (data: AppData) => {
  const sorted = getSortedSnapshots(data.snapshots);
  return sorted.length > 1 ? sorted[sorted.length - 2] : null;
};

export const getAccountMap = (accounts: Account[]) =>
  Object.fromEntries(accounts.map((account) => [account.id, account]));

export const getSnapshotTotalRub = (snapshot: Snapshot, accounts: Account[]) => {
  const accountMap = getAccountMap(accounts);
  return snapshot.entries.reduce((total, entry) => {
    const account = accountMap[entry.accountId];
    if (!account) return total;
    return total + entryValueRub(entry);
  }, 0);
};

export const getNetWorthSeries = (data: AppData) =>
  getSortedSnapshots(data.snapshots).map((snapshot) => ({
    date: snapshot.date,
    totalRub: getSnapshotTotalRub(snapshot, data.accounts)
  }));

export const getSnapshotEntryMap = (snapshot: Snapshot) =>
  Object.fromEntries(snapshot.entries.map((entry) => [entry.accountId, entry]));

export const getCurrentAccountValues = (data: AppData) => {
  const latest = getLatestSnapshot(data);
  if (!latest) return [];

  const latestEntryMap = getSnapshotEntryMap(latest);
  return data.accounts
    .filter((account) => account.isActive)
    .map((account) => {
      const entry = latestEntryMap[account.id];
      return {
        ...account,
        totalRub: entry ? entryValueRub(entry) : 0
      };
    })
    .sort((a, b) => b.totalRub - a.totalRub);
};

export const getAccountDeltaRows = (data: AppData) => {
  const latest = getLatestSnapshot(data);
  const previous = getPreviousSnapshot(data);
  if (!latest) return [];

  const latestMap = getSnapshotEntryMap(latest);
  const previousMap = previous ? getSnapshotEntryMap(previous) : {};

  return data.accounts
    .map((account) => {
      const current = latestMap[account.id];
      const prior = previousMap[account.id];
      const currentRub = current ? entryValueRub(current) : 0;
      const previousRub = prior ? entryValueRub(prior) : 0;

      return {
        ...account,
        currentRub,
        previousRub,
        deltaRub: currentRub - previousRub
      };
    })
    .sort((a, b) => Math.abs(b.deltaRub) - Math.abs(a.deltaRub));
};

export const getTagExposure = (data: AppData) => {
  const latest = getLatestSnapshot(data);
  if (!latest) return [];
  const accountMap = getAccountMap(data.accounts);

  return data.tags
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
      totalRub: latest.entries.reduce((sum, entry) => {
        const account = accountMap[entry.accountId];
        if (!account || !getAccountTagIds(account).includes(tag.id)) return sum;
        return sum + entryValueRub(entry);
      }, 0),
      color: tag.color
    }))
    .filter((tag) => tag.totalRub > 0);
};

export const getFolderExposure = getTagExposure;

export const getDigestFeed = (data: AppData) => {
  const sourceMap = Object.fromEntries(data.digestSources.map((source) => [source.id, source]));

  return [...data.digestPosts]
    .map((post) => ({ ...post, source: sourceMap[post.sourceId] }))
    .filter((post) => post.source)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .filter((post, index, posts) => posts.findIndex((candidate) => candidate.id === post.id) === index);
};

export const getRunRate = (data: AppData) => {
  const latest = getLatestSnapshot(data);
  const previous = getPreviousSnapshot(data);
  if (!latest || !previous) return null;

  const latestTotal = getSnapshotTotalRub(latest, data.accounts);
  const previousTotal = getSnapshotTotalRub(previous, data.accounts);
  const dayDiff = Math.max(
    1,
    Math.round((new Date(latest.date).getTime() - new Date(previous.date).getTime()) / 86400000)
  );

  return {
    dayDiff,
    deltaRub: latestTotal - previousTotal,
    dailyRub: (latestTotal - previousTotal) / dayDiff
  };
};

export const getPeakDrawdown = (data: AppData) => {
  const series = getNetWorthSeries(data);
  if (!series.length) return null;

  let peak = series[0];
  for (const point of series) {
    if (point.totalRub > peak.totalRub) {
      peak = point;
    }
  }

  const current = series[series.length - 1];
  const drawdownRub = current.totalRub - peak.totalRub;
  const drawdownPct = peak.totalRub === 0 ? 0 : (drawdownRub / peak.totalRub) * 100;

  return {
    peakDate: peak.date,
    peakRub: peak.totalRub,
    currentRub: current.totalRub,
    drawdownRub,
    drawdownPct
  };
};

export const getTagDeltaRows = (data: AppData) => {
  const latest = getLatestSnapshot(data);
  const previous = getPreviousSnapshot(data);
  if (!latest || !previous) return [];

  const latestMap = getSnapshotEntryMap(latest);
  const previousMap = getSnapshotEntryMap(previous);

  return data.tags
    .map((tag) => {
      let currentRub = 0;
      let previousRub = 0;

      for (const account of data.accounts) {
        if (!getAccountTagIds(account).includes(tag.id)) continue;
        const currentEntry = latestMap[account.id];
        const previousEntry = previousMap[account.id];
        currentRub += currentEntry ? entryValueRub(currentEntry) : 0;
        previousRub += previousEntry ? entryValueRub(previousEntry) : 0;
      }

      return {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        currentRub,
        previousRub,
        deltaRub: currentRub - previousRub
      };
    })
    .filter((item) => item.currentRub !== 0 || item.previousRub !== 0)
    .sort((a, b) => Math.abs(b.deltaRub) - Math.abs(a.deltaRub));
};

export const getConcentrationMetrics = (data: AppData) => {
  const current = getCurrentAccountValues(data)
    .map((item) => item.totalRub)
    .filter((value) => value > 0);

  if (!current.length) {
    return { top3Share: 0, top5Share: 0, hhi: 0 };
  }

  const total = current.reduce((sum, value) => sum + value, 0);
  const sorted = [...current].sort((a, b) => b - a);
  const top3 = sorted.slice(0, 3).reduce((sum, value) => sum + value, 0);
  const top5 = sorted.slice(0, 5).reduce((sum, value) => sum + value, 0);
  const hhi = sorted.reduce((sum, value) => {
    const share = value / total;
    return sum + share * share;
  }, 0);

  return {
    top3Share: total === 0 ? 0 : (top3 / total) * 100,
    top5Share: total === 0 ? 0 : (top5 / total) * 100,
    hhi
  };
};

export const getDataQualityMetrics = (data: AppData) => {
  const latest = getLatestSnapshot(data);
  const activeAccounts = data.accounts.filter((account) => account.isActive);
  if (!latest || !activeAccounts.length) {
    return { daysSinceLatest: null, coveragePct: 0, activeAccounts: activeAccounts.length, filledAccounts: 0 };
  }

  const filledAccountSet = new Set(latest.entries.map((entry) => entry.accountId));
  const filledAccounts = activeAccounts.filter((account) => filledAccountSet.has(account.id)).length;
  const coveragePct = (filledAccounts / activeAccounts.length) * 100;
  const daysSinceLatest = Math.max(
    0,
    Math.round((Date.now() - new Date(latest.date).getTime()) / 86400000)
  );

  return {
    daysSinceLatest,
    coveragePct,
    activeAccounts: activeAccounts.length,
    filledAccounts
  };
};
