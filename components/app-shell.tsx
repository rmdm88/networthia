"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BarChart3, DatabaseZap, HardDriveDownload, Moon, Sun, WalletCards } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const navItems = [
  { href: "/", label: "Дашборд", icon: BarChart3 },
  { href: "/accounts", label: "Счета", icon: WalletCards },
  { href: "/snapshots", label: "Срезы", icon: DatabaseZap },
  { href: "/data", label: "Данные", icon: HardDriveDownload }
];

export function AppShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="relative min-h-screen">
      <div className="grid-surface pointer-events-none absolute inset-0 -z-10 opacity-60" />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="glass sticky top-3 z-30 mb-4 rounded-[24px] border border-white/10 px-4 py-3 shadow-glow sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm uppercase tracking-[0.24em] text-[rgb(var(--muted))]">Networthia</div>

            <nav className="flex flex-wrap items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                      isActive
                        ? "border-cyan-500/70 bg-cyan-500/15 text-cyan-800 dark:text-cyan-200"
                        : "text-[rgb(var(--text))] hover:border-cyan-400/60 hover:bg-cyan-500/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition hover:border-cyan-400/60 hover:bg-cyan-500/10"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Светлая тема" : "Темная тема"}
            </button>
          </div>
        </header>

        <section className="glass mb-6 rounded-[28px] border border-white/10 px-5 py-5 shadow-glow">
          <h1 className="display-font text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm text-[rgb(var(--muted))] sm:text-base">{description}</p>
        </section>

        {children}
      </div>
    </main>
  );
}
