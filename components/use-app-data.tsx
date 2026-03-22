"use client";

import { SetStateAction, useEffect, useState } from "react";
import { STORAGE_KEY } from "@/lib/constants";
import { LegacyAppData, normalizeAppTags } from "@/lib/tags";
import { seedData } from "@/lib/seed";
import { AppData } from "@/lib/types";

export function useAppData() {
  const [data, setRawData] = useState<AppData>(normalizeAppTags(seedData));
  const [isHydrated, setIsHydrated] = useState(false);

  const setData = (nextData: SetStateAction<AppData>) => {
    setRawData((current) => {
      const resolved = typeof nextData === "function" ? (nextData as (prev: AppData) => AppData)(current) : nextData;
      return normalizeAppTags(resolved);
    });
  };

  const replaceData = (nextData: AppData | LegacyAppData) => {
    const normalized = normalizeAppTags(nextData);
    setRawData(normalized);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  };

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRawData(normalizeAppTags(JSON.parse(stored) as LegacyAppData));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, isHydrated]);

  return { data, setData, replaceData, isHydrated };
}
