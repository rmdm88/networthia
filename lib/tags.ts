import { AppData, Tag } from "@/lib/types";

export const DEFAULT_TAGS: Tag[] = [
  { id: "liquid", name: "Ликвидные активы", color: "emerald" },
  { id: "longterm", name: "Долгосрочные активы", color: "amber" },
  { id: "invest", name: "Инвестиции", color: "sky" },
  { id: "debt", name: "Долги и обязательства", color: "rose" },
  { id: "foreign", name: "Иностранные активы", color: "indigo" },
  { id: "bank", name: "Банковские счета", color: "teal" },
  { id: "cash", name: "Наличные", color: "orange" },
  { id: "brokerage", name: "Брокерские счета", color: "violet" },
  { id: "crypto", name: "Криптоактивы", color: "fuchsia" },
  { id: "reserve", name: "Резерв", color: "slate" }
];

export type LegacyFolder = Tag;

export type LegacyAccount = Omit<AppData["accounts"][number], "tagIds"> & {
  type?: string;
  folderIds?: string[];
  tagIds?: string[];
};

export type LegacyDigestSource = Omit<AppData["digestSources"][number], "tagIds"> & {
  folderIds?: string[];
  tagIds?: string[];
};

export type LegacyAppData = Omit<AppData, "tags" | "accounts" | "digestSources"> & {
  tags?: Tag[];
  folders?: LegacyFolder[];
  accounts: LegacyAccount[];
  digestSources: LegacyDigestSource[];
};

const VALID_TAG_IDS = new Set(DEFAULT_TAGS.map((tag) => tag.id));

const remapTagId = (tagId: string) => {
  if (tagId === "media") return "invest";
  return tagId;
};

const getNormalizedTagIds = (tagIds: string[]) => {
  const next = tagIds
    .map(remapTagId)
    .filter((tagId, index, list) => VALID_TAG_IDS.has(tagId) && list.indexOf(tagId) === index);

  return next.length ? next : ["liquid"];
};

export const getAccountTagIds = (account: { tagIds?: string[]; folderIds?: string[] }) =>
  getNormalizedTagIds(account.tagIds ?? account.folderIds ?? []);

export const getDigestSourceTagIds = (source: { tagIds?: string[]; folderIds?: string[] }) =>
  getNormalizedTagIds(source.tagIds ?? source.folderIds ?? []);

export function normalizeAppTags(data: LegacyAppData | AppData): AppData {
  const { accounts, digestSources, ...rest } = data as LegacyAppData;

  return {
    ...rest,
    tags: DEFAULT_TAGS,
    accounts: accounts.map((account) => {
      const { folderIds: _legacyFolderIds, type: _legacyType, ...accountRest } = account;
      return {
        ...accountRest,
        tagIds: getAccountTagIds(account)
      };
    }),
    digestSources: digestSources.map((source) => {
      const { folderIds: _legacyFolderIds, ...sourceRest } = source;
      return {
        ...sourceRest,
        tagIds: getDigestSourceTagIds(source)
      };
    })
  };
}
