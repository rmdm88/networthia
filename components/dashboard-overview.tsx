"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import clsx from "clsx";
import { AppShell } from "@/components/app-shell";
import { useAppData } from "@/components/use-app-data";
import {
  formatCompactRub,
  formatCurrency,
  getAccountDeltaRows,
  getConcentrationMetrics,
  getCurrentAccountValues,
  getDataQualityMetrics,
  getLatestSnapshot,
  getNetWorthSeries,
  getPeakDrawdown,
  getPreviousSnapshot,
  getRunRate,
  getSnapshotTotalRub,
  getTagDeltaRows,
  getTagExposure
} from "@/lib/finance";
import { getAccountTagIds } from "@/lib/tags";

const accountDonutPalette = [
  "#E9E3CD",
  "#E2563C",
  "#8D8570",
  "#A9895D",
  "#7FBF8F",
  "#B7A98A",
  "#C9775A",
  "#6F7567",
  "#3E4353"
];

export function DashboardOverview() {
  const { data } = useAppData();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const chartTooltipStyle = {
    borderRadius: 8,
    border: "1px solid rgb(var(--line))",
    background: "rgb(var(--panel) / 0.96)",
    color: "rgb(var(--text))"
  } as const;

  const filteredData = useMemo(() => {
    if (!selectedTagIds.length) return data;

    const selectedSet = new Set(selectedTagIds);
    const filteredAccounts = data.accounts.filter((account) =>
      getAccountTagIds(account).some((tagId) => selectedSet.has(tagId))
    );
    const accountIdSet = new Set(filteredAccounts.map((account) => account.id));

    return {
      ...data,
      accounts: filteredAccounts,
      snapshots: data.snapshots.map((snapshot) => ({
        ...snapshot,
        entries: snapshot.entries.filter((entry) => accountIdSet.has(entry.accountId))
      }))
    };
  }, [data, selectedTagIds]);

  const latestSnapshot = useMemo(() => getLatestSnapshot(filteredData), [filteredData]);
  const previousSnapshot = useMemo(() => getPreviousSnapshot(filteredData), [filteredData]);
  const netWorthSeries = useMemo(() => getNetWorthSeries(filteredData), [filteredData]);
  const tagExposure = useMemo(() => getTagExposure(filteredData), [filteredData]);
  const topPositions = useMemo(() => getCurrentAccountValues(filteredData).slice(0, 6), [filteredData]);
  const topMovers = useMemo(() => getAccountDeltaRows(filteredData).slice(0, 6), [filteredData]);
  const runRate = useMemo(() => getRunRate(filteredData), [filteredData]);
  const drawdown = useMemo(() => getPeakDrawdown(filteredData), [filteredData]);
  const concentration = useMemo(() => getConcentrationMetrics(filteredData), [filteredData]);
  const dataQuality = useMemo(() => getDataQualityMetrics(filteredData), [filteredData]);
  const tagDeltaRows = useMemo(() => getTagDeltaRows(filteredData), [filteredData]);

  const accountStructureRows = useMemo(() => {
    const sorted = getCurrentAccountValues(filteredData).filter((account) => account.totalRub > 0);
    const top = sorted.slice(0, 8);
    const restTotal = sorted.slice(8).reduce((sum, account) => sum + account.totalRub, 0);

    const rows = top.map((account) => ({
      id: account.id,
      name: account.name,
      totalRub: account.totalRub
    }));

    if (restTotal > 0) {
      rows.push({
        id: "others",
        name: "Прочие счета",
        totalRub: restTotal
      });
    }
    return rows;
  }, [filteredData]);

  const currentTotal = latestSnapshot ? getSnapshotTotalRub(latestSnapshot, filteredData.accounts) : 0;
  const previousTotal = previousSnapshot ? getSnapshotTotalRub(previousSnapshot, filteredData.accounts) : 0;
  const delta = currentTotal - previousTotal;
  const deltaPct = previousTotal === 0 ? 0 : (delta / previousTotal) * 100;

  const liquidTotal = tagExposure.find((item) => item.id === "liquid")?.totalRub ?? 0;
  const liquidShare = currentTotal > 0 ? (liquidTotal / currentTotal) * 100 : 0;
  const activeAccountsCount = filteredData.accounts.filter((account) => account.isActive).length;
  const topTagDelta = tagDeltaRows.slice(0, 3);

  const attentionItems = useMemo(() => {
    const items: string[] = [];

    if (dataQuality.daysSinceLatest !== null && dataQuality.daysSinceLatest > 30) {
      items.push(`Последний срез старше 30 дней (${dataQuality.daysSinceLatest} дн.)`);
    }
    if (dataQuality.coveragePct < 80) {
      items.push(`Покрытие активных счетов ниже 80% (${dataQuality.coveragePct.toFixed(0)}%)`);
    }
    if (concentration.top3Share > 70) {
      items.push(`Высокая концентрация: Top-3 = ${concentration.top3Share.toFixed(1)}%`);
    }
    if (drawdown && drawdown.drawdownPct <= -20) {
      items.push(`Глубокая просадка от пика: ${drawdown.drawdownPct.toFixed(1)}%`);
    }

    return items;
  }, [concentration.top3Share, dataQuality.coveragePct, dataQuality.daysSinceLatest, drawdown]);

  return (
    <AppShell
      title="Обзор капитала по срезам и структуре активов"
      description="Динамика капитала, структура по счетам, изменения между срезами и показатели качества данных."
    >
      <section className="mb-4 glass rounded-lg border p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[rgb(var(--muted))]">Фильтр дашборда по тегам</p>
          {selectedTagIds.length ? (
            <button
              onClick={() => setSelectedTagIds([])}
              className="rounded border px-3 py-1 text-xs transition hover:border-[rgb(var(--accent)/0.55)] hover:bg-[rgb(var(--accent)/0.12)] hover:text-[rgb(var(--text))] dark:hover:text-[rgb(var(--text))]"
            >
              Сбросить
            </button>
          ) : null}
        </div>
        <p className="mb-3 text-xs text-[rgb(var(--muted))]">Выбранные теги влияют на все виджеты ниже.</p>
        <div className="flex flex-wrap gap-2">
          {data.tags.map((tag) => {
            const selected = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  setSelectedTagIds((current) =>
                    selected ? current.filter((id) => id !== tag.id) : [...current, tag.id]
                  )
                }
                className={clsx(
                  "rounded border px-3 py-1.5 text-sm transition",
                  selected
                    ? "border-[rgb(var(--accent)/0.65)] bg-[rgb(var(--accent)/0.12)] text-[rgb(var(--text))] dark:text-[rgb(var(--text))]"
                    : "hover:border-[rgb(var(--accent)/0.55)] hover:bg-[rgb(var(--accent)/0.12)]"
                )}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-2">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[rgb(var(--muted))]">Состояние</h2>
      </section>
      <section className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="glass rounded-lg border p-4">
          <p className="text-sm text-[rgb(var(--muted))]">Общий капитал</p>
          <p className="display-font mt-2 text-2xl font-semibold">{formatCurrency(currentTotal)}</p>
        </article>
        <article className="glass rounded-lg border p-4">
          <p className="text-sm text-[rgb(var(--muted))]">
            Изменение к срезу {previousSnapshot ? `от ${previousSnapshot.date}` : "—"}
          </p>
          <p
            className={clsx(
              "display-font mt-2 text-2xl font-semibold",
              delta >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
            )}
          >
            {delta >= 0 ? "+" : ""}
            {formatCompactRub(delta)}
          </p>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">{deltaPct.toFixed(1)}%</p>
        </article>
        <article className="glass rounded-lg border p-4">
          <p className="text-sm text-[rgb(var(--muted))]">Ликвидные активы</p>
          <p className="display-font mt-2 text-2xl font-semibold">{formatCompactRub(liquidTotal)}</p>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">{liquidShare.toFixed(1)}% от капитала</p>
        </article>
        <article className="glass rounded-lg border p-4">
          <p className="text-sm text-[rgb(var(--muted))]">Активные счета</p>
          <p className="display-font mt-2 text-2xl font-semibold">{activeAccountsCount}</p>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            {latestSnapshot ? `Последний срез: ${latestSnapshot.date}` : "Срезов пока нет"}
          </p>
        </article>
      </section>

      <section className="mb-2">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[rgb(var(--muted))]">Риск и качество</h2>
      </section>
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="glass rounded-lg border p-4">
          <p className="text-sm text-[rgb(var(--muted))]">Просадка от пика</p>
          <p
            className={clsx(
              "display-font mt-2 text-2xl font-semibold",
              (drawdown?.drawdownRub ?? 0) < 0 ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"
            )}
          >
            {drawdown ? formatCompactRub(drawdown.drawdownRub) : "—"}
          </p>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            {drawdown ? `Пик: ${drawdown.peakDate} (${drawdown.drawdownPct.toFixed(1)}%)` : "Недостаточно данных"}
          </p>
        </article>
        <article className="glass rounded-lg border p-4">
          <p className="text-sm text-[rgb(var(--muted))]">Концентрация капитала</p>
          <p className="display-font mt-2 text-2xl font-semibold">{concentration.top3Share.toFixed(1)}%</p>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Top-3 / Top-5: {concentration.top3Share.toFixed(1)}% / {concentration.top5Share.toFixed(1)}%
          </p>
          <p className="text-xs text-[rgb(var(--muted))]">HHI: {concentration.hhi.toFixed(3)}</p>
        </article>
        <article className="glass rounded-lg border p-4">
          <p className="text-sm text-[rgb(var(--muted))]">Качество данных</p>
          <p className="display-font mt-2 text-2xl font-semibold">{dataQuality.coveragePct.toFixed(0)}%</p>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Заполнено {dataQuality.filledAccounts}/{dataQuality.activeAccounts} активных счетов
          </p>
          <p className="text-xs text-[rgb(var(--muted))]">
            {dataQuality.daysSinceLatest === null ? "Нет срезов" : `Последний срез: ${dataQuality.daysSinceLatest} дн. назад`}
          </p>
        </article>
        <article className="glass rounded-lg border p-4">
          <p className="text-sm text-[rgb(var(--muted))]">Нужно внимание</p>
          {attentionItems.length ? (
            <div className="mt-2 space-y-2">
              {attentionItems.slice(0, 3).map((item) => (
                <p key={item} className="rounded border border-amber-500/35 bg-amber-500/12 px-2.5 py-2 text-xs text-amber-800 dark:text-amber-200">
                  {item}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded border border-emerald-500/35 bg-emerald-500/12 px-2.5 py-2 text-xs text-emerald-800 dark:text-emerald-200">
              Критичных сигналов нет.
            </p>
          )}
        </article>
      </section>

      <section className="mb-6">
        <article className="glass rounded-lg border p-4">
          <div className="mb-3">
            <h3 className="display-font text-xl font-semibold">Вклад тегов в дельту</h3>
            <p className="text-sm text-[rgb(var(--muted))]">
              Топ-3 тегов по изменению к {previousSnapshot ? `срезу от ${previousSnapshot.date}` : "предыдущему срезу"}.
            </p>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            {topTagDelta.length ? (
              topTagDelta.map((tag) => (
                <div key={tag.id} className="ui-card flex items-center justify-between gap-3 px-3 py-2">
                  <span className="truncate">{tag.name}</span>
                  <span
                    className={clsx(
                      "whitespace-nowrap text-sm font-semibold",
                      tag.deltaRub >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
                    )}
                  >
                    {tag.deltaRub >= 0 ? "+" : ""}
                    {formatCompactRub(tag.deltaRub)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[rgb(var(--muted))]">Недостаточно данных (нужно минимум два среза).</p>
            )}
          </div>
        </article>
      </section>

      <section className="mb-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr] xl:items-stretch">
        <article className="glass h-full rounded-lg border p-5 shadow-glow">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="display-font text-2xl font-semibold">Динамика капитала</h2>
              <p className="text-sm text-[rgb(var(--muted))]">История по сохраненным срезам.</p>
            </div>
            <div className="text-sm text-[rgb(var(--muted))]">
              {latestSnapshot?.date ?? "Нет данных"} / {previousSnapshot?.date ?? "—"}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthSeries}>
                <defs>
                  <linearGradient id="netWorthFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#E9E3CD" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#E9E3CD" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(233,227,205,0.12)" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={chartTooltipStyle}
                  itemStyle={{ color: "rgb(var(--text))" }}
                  labelStyle={{ color: "rgb(var(--text))" }}
                />
                <Area type="monotone" dataKey="totalRub" stroke="#E9E3CD" strokeWidth={2} fill="url(#netWorthFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <article className="glass h-full rounded-lg border p-5">
            <h3 className="display-font text-xl font-semibold">Темп изменения</h3>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">
              {runRate
                ? `За ${runRate.dayDiff} дн.: ${runRate.deltaRub >= 0 ? "+" : ""}${formatCompactRub(runRate.deltaRub)}`
                : "Нужно минимум два среза для расчета."}
            </p>
            <p className="mt-2 text-2xl font-semibold">{runRate ? `${formatCompactRub(runRate.dailyRub)} / день` : "—"}</p>
          </article>
          <article className="glass h-full rounded-lg border p-5">
            <h3 className="display-font text-xl font-semibold">Контрольные точки</h3>
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-[rgb(var(--muted))]">Последний срез</p>
              <p className="font-medium">{latestSnapshot?.date ?? "Срезов пока нет"}</p>
              <p className="pt-2 text-[rgb(var(--muted))]">Предыдущий срез</p>
              <p className="font-medium">{previousSnapshot?.date ?? "Нет предыдущего среза"}</p>
            </div>
          </article>
        </div>
      </section>

      <section className="mb-6">
        <article className="glass rounded-lg border p-5">
          <div className="mb-4">
            <h3 className="display-font text-2xl font-semibold">Структура по счетам</h3>
            <p className="text-sm text-[rgb(var(--muted))]">
              Top-8 счетов плюс «Прочие счета» на последнем срезе. Учитывает выбранные фильтры по тегам.
            </p>
          </div>
          <div>
            {accountStructureRows.length ? (
              <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
                <div className="h-[320px] lg:h-full lg:min-h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={accountStructureRows} dataKey="totalRub" innerRadius={84} outerRadius={142} paddingAngle={3}>
                        {accountStructureRows.map((row, index) => (
                          <Cell key={row.id} fill={accountDonutPalette[index % accountDonutPalette.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ""}
                        contentStyle={chartTooltipStyle}
                        itemStyle={{ color: "rgb(var(--text))" }}
                        labelStyle={{ color: "rgb(var(--text))" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {accountStructureRows.map((row, index) => (
                    <div key={row.id} className="ui-card flex items-center justify-between gap-4 px-3 py-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="h-3 w-3 rounded"
                          style={{ backgroundColor: accountDonutPalette[index % accountDonutPalette.length] }}
                        />
                        <span className="truncate">{row.name}</span>
                      </div>
                      <span className="whitespace-nowrap text-sm text-[rgb(var(--muted))]">{formatCompactRub(row.totalRub)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[220px] items-center justify-center text-sm text-[rgb(var(--muted))]">
                Нет данных по счетам для выбранных тегов.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2 xl:items-stretch">
        <article className="glass h-full rounded-lg border p-5">
          <div className="mb-4">
            <h3 className="display-font text-2xl font-semibold">Главные изменения</h3>
            <p className="text-sm text-[rgb(var(--muted))]">
              Топ-изменений к {previousSnapshot ? `срезу от ${previousSnapshot.date}` : "предыдущему срезу"}.
            </p>
          </div>
          <div className="space-y-3">
            {topMovers.map((account) => (
              <div key={account.id} className="ui-card flex items-center justify-between gap-4 px-3 py-3">
                <div>
                  <div className="font-medium">{account.name}</div>
                  <div className="text-sm text-[rgb(var(--muted))]">
                    {formatCurrency(account.previousRub)} до {formatCurrency(account.currentRub)}
                  </div>
                </div>
                <div
                  className={clsx(
                    "rounded px-3 py-1 text-sm font-medium",
                    account.deltaRub >= 0
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                  )}
                >
                  {account.deltaRub >= 0 ? "+" : ""}
                  {formatCompactRub(account.deltaRub)}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="glass h-full rounded-lg border p-5">
          <div className="mb-4">
            <h3 className="display-font text-2xl font-semibold">Последние срезы</h3>
            <p className="text-sm text-[rgb(var(--muted))]">Последние контрольные точки с капиталом и дельтой.</p>
          </div>
          <div className="space-y-3">
            {[...netWorthSeries].slice(-6).reverse().map((point, index, points) => {
              const previousPoint = points[index + 1];
              const pointDelta = previousPoint ? point.totalRub - previousPoint.totalRub : 0;
              return (
                <div key={point.date} className="ui-card p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">{point.date}</div>
                      <div className="text-sm text-[rgb(var(--muted))]">{formatCurrency(point.totalRub)}</div>
                    </div>
                    {previousPoint ? (
                      <div
                        className={clsx(
                          "rounded px-3 py-1 text-sm font-medium",
                          pointDelta >= 0
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                        )}
                      >
                        {pointDelta >= 0 ? "+" : ""}
                        {formatCompactRub(pointDelta)}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="mt-4">
        <article className="glass rounded-lg border p-5">
          <div className="mb-4">
            <h3 className="display-font text-2xl font-semibold">Крупнейшие позиции</h3>
            <p className="text-sm text-[rgb(var(--muted))]">На что приходится основной объем капитала.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {topPositions.map((account) => (
              <div key={account.id} className="ui-card flex items-center justify-between gap-4 px-3 py-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{account.name}</div>
                  <div className="text-sm text-[rgb(var(--muted))]">{account.currency}</div>
                </div>
                <div className="whitespace-nowrap text-right font-medium">{formatCurrency(account.totalRub)}</div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}

