"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BarChart3, DatabaseZap, HardDriveDownload, WalletCards } from "lucide-react";

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

  return (
    <main className="relative min-h-screen">
      <div className="grid-surface pointer-events-none absolute inset-0 -z-10 opacity-60" />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="glass sticky top-3 z-30 mb-4 rounded-lg border px-4 py-3 shadow-glow sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[rgb(var(--muted))]">Networthia</div>

            <nav className="flex flex-wrap items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "inline-flex items-center gap-2 rounded px-3 py-2 text-sm transition",
                      isActive
                        ? "border border-[rgb(var(--accent)/0.55)] bg-[rgb(var(--accent)/0.12)] text-[rgb(var(--text))]"
                        : "border border-transparent text-[rgb(var(--muted))] hover:border-[rgb(var(--line))] hover:bg-[rgb(var(--text)/0.05)] hover:text-[rgb(var(--text))]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <section className="glass mb-6 rounded-lg border px-5 py-5 shadow-glow">
          <h1 className="display-font text-3xl font-medium sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm text-[rgb(var(--muted))] sm:text-base">{description}</p>
        </section>

        {children}
      </div>
    </main>
  );
}
