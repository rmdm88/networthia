"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, WalletCards } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAppData } from "@/components/use-app-data";
import {
  formatCompactRub,
  formatCurrency,
  getSnapshotTotalRub,
  getSortedSnapshots
} from "@/lib/finance";

export function SnapshotsManager() {
  const { data, setData } = useAppData();
  const [snapshotDate, setSnapshotDate] = useState("2026-03-03");
  const [draftEntries, setDraftEntries] = useState<Record<string, { amount: string }>>({});
  const [fxRates, setFxRates] = useState<Record<string, { rate?: number; source?: string; error?: string }>>({});
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  const activeAccounts = useMemo(() => data.accounts.filter((account) => account.isActive), [data.accounts]);
  const recentSnapshots = useMemo(() => {
    const sorted = getSortedSnapshots(data.snapshots);

    return sorted
      .map((snapshot, index) => {
        const previousSnapshot = index > 0 ? sorted[index - 1] : null;
        const totalRub = getSnapshotTotalRub(snapshot, data.accounts);
        const previousTotalRub = previousSnapshot ? getSnapshotTotalRub(previousSnapshot, data.accounts) : null;

        return {
          id: snapshot.id,
          date: snapshot.date,
          totalRub,
          deltaRub: previousTotalRub === null ? null : totalRub - previousTotalRub
        };
      })
      .slice(-8)
      .reverse();
  }, [data.accounts, data.snapshots]);
  const hasRateErrors = activeAccounts.some((account) => {
    const rateMeta = fxRates[account.currency.toUpperCase()];
    return !rateMeta || Boolean(rateMeta.error) || !rateMeta.rate;
  });

  useEffect(() => {
    setDraftEntries((current) => {
      const next = { ...current };
      for (const account of activeAccounts) {
        next[account.id] ??= { amount: "" };
      }
      return next;
    });
  }, [activeAccounts]);

  useEffect(() => {
    const currencies = [...new Set(activeAccounts.map((account) => account.currency.toUpperCase()))];
    if (!currencies.length) return;

    const controller = new AbortController();

    const loadRates = async () => {
      setIsLoadingRates(true);
      try {
        const url = new URL("/api/fx", window.location.origin);
        url.searchParams.set("date", snapshotDate);
        url.searchParams.set("currencies", currencies.join(","));

        const response = await fetch(url.toString(), { signal: controller.signal });
        const payload = (await response.json()) as {
          rates?: Record<string, { rate?: number; source?: string; error?: string }>;
        };

        if (!response.ok || !payload.rates) {
          throw new Error("Не удалось загрузить исторические курсы");
        }

        setFxRates(payload.rates);
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Ошибка загрузки курсов";
        setFxRates(Object.fromEntries(currencies.map((currency) => [currency, { error: message }])));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingRates(false);
        }
      }
    };

    void loadRates();

    return () => controller.abort();
  }, [activeAccounts, snapshotDate]);

  const saveSnapshot = () => {
    const entries = activeAccounts
      .map((account) => {
        const draft = draftEntries[account.id];
        const amount = Number(draft?.amount ?? 0);
        const fxRateToRub = fxRates[account.currency.toUpperCase()]?.rate ?? 0;
        if (!Number.isFinite(amount) || !Number.isFinite(fxRateToRub) || fxRateToRub <= 0) return null;
        return { accountId: account.id, amount, fxRateToRub };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

    if (!entries.length) return;

    setData((current) => ({
      ...current,
      snapshots: [
        ...current.snapshots,
        {
          id: crypto.randomUUID(),
          date: snapshotDate,
          entries
        }
      ]
    }));

    setDraftEntries((current) =>
      Object.fromEntries(Object.entries(current).map(([accountId]) => [accountId, { amount: "" }]))
    );
  };

  const deleteSnapshot = (snapshotId: string) => {
    const confirmed = window.confirm("Удалить этот срез? Действие нельзя отменить.");
    if (!confirmed) return;

    setData((current) => ({
      ...current,
      snapshots: current.snapshots.filter((snapshot) => snapshot.id !== snapshotId)
    }));
  };

  return (
    <AppShell
      title="Ввод срезов и исторические контрольные точки"
      description="Отдельный экран для ввода нового среза. Заполняешь только текущие балансы по активным счетам на выбранную дату, остальное система считает сама."
    >
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass rounded-lg border p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="display-font text-2xl font-semibold">Новый срез</h3>
              <p className="text-sm text-[rgb(var(--muted))]">
                Баланс по каждому активному счету и курс в RUB на дату среза.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isLoadingRates ? <span className="text-xs text-[rgb(var(--muted))]">Загружаем курсы...</span> : null}
              <input
                type="date"
                value={snapshotDate}
                onChange={(event) => setSnapshotDate(event.target.value)}
                className="ui-field text-sm"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-[rgb(var(--text)/0.06)] text-left text-[rgb(var(--muted))] dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3 font-medium">Счет</th>
                  <th className="px-4 py-3 font-medium">Баланс</th>
                </tr>
              </thead>
              <tbody>
                {activeAccounts.map((account) => {
                  const rateMeta = fxRates[account.currency.toUpperCase()];
                  return (
                    <tr key={account.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="rounded bg-white/5 p-2">
                            <WalletCards className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="font-medium">{account.name}</div>
                            <div className="text-xs text-[rgb(var(--muted))]">
                              {account.currency}
                              {rateMeta?.rate ? ` · ${rateMeta.rate.toFixed(rateMeta.rate >= 1000 ? 0 : 4)} RUB` : ""}
                              {rateMeta?.error ? " · курс недоступен" : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={draftEntries[account.id]?.amount ?? ""}
                          onChange={(event) =>
                            setDraftEntries((current) => ({
                              ...current,
                              [account.id]: {
                                ...(current[account.id] ?? { amount: "" }),
                                amount: event.target.value
                              }
                            }))
                          }
                          className="ui-field w-full"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {hasRateErrors ? (
            <div className="mt-4 rounded border border-amber-500/40 bg-amber-500/12 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
              Не удалось получить курсы для части валют на выбранную дату. Сохранять такой срез нельзя, пока данные не загрузятся.
            </div>
          ) : null}

          <div className="mt-4 flex justify-end">
            <button
              onClick={saveSnapshot}
              disabled={isLoadingRates || hasRateErrors}
              className="inline-flex items-center gap-2 rounded bg-[rgb(var(--accent))] px-5 py-3 text-sm font-semibold text-[#06070C] transition hover:bg-[rgb(var(--accent)/0.86)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Сохранить срез
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="glass rounded-lg border p-5">
            <div className="mb-4">
              <h3 className="display-font text-2xl font-semibold">Последняя история</h3>
              <p className="text-sm text-[rgb(var(--muted))]">Последние значения капитала после сохраненных срезов.</p>
            </div>
            <div className="space-y-3">
              {recentSnapshots.map((snapshot) => {
                return (
                  <div key={snapshot.id} className="ui-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium">{snapshot.date}</div>
                        <div className="text-sm text-[rgb(var(--muted))]">{formatCurrency(snapshot.totalRub)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {snapshot.deltaRub !== null ? (
                          <div className="text-sm font-medium text-[rgb(var(--muted))]">
                            {snapshot.deltaRub >= 0 ? "+" : ""}
                            {formatCompactRub(snapshot.deltaRub)}
                          </div>
                        ) : null}
                        <button
                          onClick={() => deleteSnapshot(snapshot.id)}
                          className="rounded border px-2.5 py-2 text-[rgb(var(--muted))] transition hover:border-rose-400/60 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300"
                          title="Удалить срез"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-lg border p-5">
            <div className="mb-4">
              <h3 className="display-font text-2xl font-semibold">Как это работает</h3>
            </div>
            <div className="space-y-3 text-sm text-[rgb(var(--muted))]">
              <p>1. Выбираешь дату контрольного среза.</p>
              <p>2. Вписываешь актуальный баланс по каждому активному счету.</p>
              <p>3. Исторические курсы к RUB подтягиваются автоматически на эту дату.</p>
              <p>4. Дашборд автоматически пересчитает общий капитал и дельту к предыдущему срезу.</p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

