export type ThemeMode = "light" | "dark";

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type Account = {
  id: string;
  name: string;
  currency: string;
  tagIds: string[];
  isActive: boolean;
  note?: string;
};

export type SnapshotEntry = {
  accountId: string;
  amount: number;
  fxRateToRub: number;
};

export type Snapshot = {
  id: string;
  date: string;
  entries: SnapshotEntry[];
};

export type DigestSource = {
  id: string;
  name: string;
  tagIds: string[];
};

export type DigestPost = {
  id: string;
  sourceId: string;
  title: string;
  summary: string;
  publishedAt: string;
  tag: "macro" | "markets" | "productivity" | "crypto";
};

export type AppData = {
  tags: Tag[];
  accounts: Account[];
  snapshots: Snapshot[];
  digestSources: DigestSource[];
  digestPosts: DigestPost[];
};
