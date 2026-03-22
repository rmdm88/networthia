import { AppData } from "@/lib/types";
import { LegacyAppData } from "@/lib/tags";

export const BACKUP_SCHEMA_VERSION = 1;

export type BackupPayload = {
  schemaVersion: number;
  exportedAt: string;
  appData: AppData | LegacyAppData;
};

const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export function isValidAppData(value: unknown): value is AppData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AppData> & { folders?: unknown[] };

  if (!Array.isArray(candidate.accounts) || !Array.isArray(candidate.snapshots)) {
    return false;
  }
  if (!Array.isArray(candidate.digestSources) || !Array.isArray(candidate.digestPosts)) return false;

  const tagsOrFolders = Array.isArray(candidate.tags) ? candidate.tags : candidate.folders;
  if (!Array.isArray(tagsOrFolders)) return false;
  const tagsValid = tagsOrFolders.every((tag) => {
    if (!tag || typeof tag !== "object") return false;
    const candidateTag = tag as { id?: unknown; name?: unknown; color?: unknown };
    return isString(candidateTag.id) && isString(candidateTag.name) && isString(candidateTag.color);
  });
  if (!tagsValid) return false;

  const accountsValid = candidate.accounts.every(
    (account) =>
      account &&
      typeof account === "object" &&
      isString(account.id) &&
      isString(account.name) &&
      isString(account.currency) &&
      (isStringArray(account.tagIds) || isStringArray((account as { folderIds?: unknown }).folderIds)) &&
      typeof account.isActive === "boolean"
  );
  if (!accountsValid) return false;

  const snapshotsValid = candidate.snapshots.every(
    (snapshot) =>
      snapshot &&
      typeof snapshot === "object" &&
      isString(snapshot.id) &&
      isString(snapshot.date) &&
      Array.isArray(snapshot.entries) &&
      snapshot.entries.every(
        (entry) =>
          entry &&
          typeof entry === "object" &&
          isString(entry.accountId) &&
          isNumber(entry.amount) &&
          isNumber(entry.fxRateToRub)
      )
  );
  if (!snapshotsValid) return false;

  const sourcesValid = candidate.digestSources.every(
    (source) =>
      source &&
      typeof source === "object" &&
      isString(source.id) &&
      isString(source.name) &&
      (isStringArray(source.tagIds) || isStringArray((source as { folderIds?: unknown }).folderIds))
  );
  if (!sourcesValid) return false;

  const postsValid = candidate.digestPosts.every(
    (post) =>
      post &&
      typeof post === "object" &&
      isString(post.id) &&
      isString(post.sourceId) &&
      isString(post.title) &&
      isString(post.summary) &&
      isString(post.publishedAt) &&
      isString(post.tag)
  );

  return postsValid;
}

export function parseImportedPayload(raw: unknown): AppData | LegacyAppData | null {
  if (isValidAppData(raw)) return raw;

  if (!raw || typeof raw !== "object") return null;
  const payload = raw as Partial<BackupPayload>;
  if (!payload.appData) return null;
  return isValidAppData(payload.appData) ? payload.appData : null;
}
