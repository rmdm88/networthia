"use client";

import { useRef, useState } from "react";
import { Download, FileJson, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAppData } from "@/components/use-app-data";
import { BACKUP_SCHEMA_VERSION, parseImportedPayload } from "@/lib/data-transfer";

export function DataManager() {
  const { data, replaceData } = useAppData();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const exportJson = () => {
    const payload = {
      schemaVersion: BACKUP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      appData: data
    };

    const fileName = `networthia-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
    setError("");
    setStatus(`Экспорт выполнен: ${fileName}`);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const importedData = parseImportedPayload(parsed);

      if (!importedData) {
        throw new Error("Некорректный JSON: не удалось распознать структуру данных.");
      }

      replaceData(importedData);
      setError("");
      setStatus(`Импорт выполнен: ${file.name}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Ошибка импорта";
      setStatus("");
      setError(message);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <AppShell
      title="Данные и резервные копии"
      description="Все данные хранятся локально в браузере. Здесь можно выгрузить резервную копию в JSON и восстановить ее импортом."
    >
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass rounded-[28px] border p-5">
          <div className="mb-4">
            <h3 className="display-font text-2xl font-semibold">Экспорт JSON</h3>
            <p className="text-sm text-[rgb(var(--muted))]">
              Создает файл с полной копией данных: счета, срезы, папки и дайджесты.
            </p>
          </div>
          <button
            onClick={exportJson}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <Download className="h-4 w-4" />
            Скачать резервную копию
          </button>
        </div>

        <div className="glass rounded-[28px] border p-5">
          <div className="mb-4">
            <h3 className="display-font text-2xl font-semibold">Импорт JSON</h3>
            <p className="text-sm text-[rgb(var(--muted))]">
              Загружает данные из резервного файла и полностью заменяет текущую локальную базу.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm transition hover:border-cyan-400/60 hover:bg-cyan-500/10"
          >
            <Upload className="h-4 w-4" />
            Загрузить JSON
          </button>
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass rounded-[28px] border p-5">
          <div className="mb-3 flex items-center gap-2">
            <FileJson className="h-5 w-5 text-cyan-300" />
            <h3 className="display-font text-xl font-semibold">Что внутри бэкапа</h3>
          </div>
          <div className="space-y-2 text-sm text-[rgb(var(--muted))]">
            <p>1. `schemaVersion` для будущих миграций формата.</p>
            <p>2. `exportedAt` с датой и временем выгрузки.</p>
            <p>3. `appData` со всеми пользовательскими данными.</p>
            <p>4. Импорт поддерживает как текущий формат, так и «чистый» `appData` JSON.</p>
          </div>
        </div>

        <div className="glass rounded-[28px] border p-5">
          <h3 className="display-font mb-3 text-xl font-semibold">Статус</h3>
          {status ? (
            <p className="rounded-2xl border border-emerald-500/35 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
              {status}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-2xl border border-rose-500/35 bg-rose-500/12 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
              {error}
            </p>
          ) : null}
          {!status && !error ? <p className="text-sm text-[rgb(var(--muted))]">Операций пока не было.</p> : null}
        </div>
      </section>
    </AppShell>
  );
}
