"use client";

import { Dispatch, SetStateAction, useState } from "react";
import clsx from "clsx";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, WalletCards, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAppData } from "@/components/use-app-data";
import { cryptoCurrencyOptions, fiatCurrencyOptions } from "@/lib/currency-options";
import { Account } from "@/lib/types";
import { getAccountTagIds } from "@/lib/tags";

type AccountDraft = {
  name: string;
  currency: string;
  tagIds: string[];
};

export function AccountsManager() {
  const { data, setData } = useAppData();
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<AccountDraft | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAccount, setNewAccount] = useState<AccountDraft>({
    name: "",
    currency: "RUB",
    tagIds: ["liquid"]
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const resetCreateForm = () => {
    setNewAccount({
      name: "",
      currency: "RUB",
      tagIds: ["liquid"]
    });
  };

  const addAccount = () => {
    if (!newAccount.name.trim()) return;

    setData((current) => ({
      ...current,
      accounts: [
        ...current.accounts,
        {
          id: crypto.randomUUID(),
          name: newAccount.name.trim(),
          currency: newAccount.currency.toUpperCase(),
          tagIds: newAccount.tagIds,
          isActive: true
        }
      ]
    }));

    resetCreateForm();
    setIsCreateOpen(false);
  };

  const startEditing = (accountId: string) => {
    const account = data.accounts.find((item) => item.id === accountId);
    if (!account) return;

    setEditingAccountId(accountId);
    setEditingDraft({
      name: account.name,
      currency: account.currency,
      tagIds: getAccountTagIds(account)
    });
  };

  const cancelEditing = () => {
    setEditingAccountId(null);
    setEditingDraft(null);
  };

  const saveEditing = () => {
    if (!editingAccountId || !editingDraft || !editingDraft.name.trim()) return;

    setData((current) => ({
      ...current,
      accounts: current.accounts.map((account) =>
        account.id === editingAccountId
          ? {
              ...account,
              name: editingDraft.name.trim(),
              currency: editingDraft.currency.toUpperCase(),
              tagIds: editingDraft.tagIds
            }
          : account
      )
    }));

    cancelEditing();
  };

  const toggleAccount = (accountId: string) => {
    setData((current) => ({
      ...current,
      accounts: current.accounts.map((account) =>
        account.id === accountId ? { ...account, isActive: !account.isActive } : account
      )
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setData((current) => {
      const oldIndex = current.accounts.findIndex((account) => account.id === String(active.id));
      const newIndex = current.accounts.findIndex((account) => account.id === String(over.id));
      if (oldIndex === -1 || newIndex === -1) return current;

      return {
        ...current,
        accounts: arrayMove(current.accounts, oldIndex, newIndex)
      };
    });
  };

  return (
    <AppShell
      title="Каталог счетов и структура активов"
      description="Управление списком счетов: название, валюта, теги и статус активности. Классификация полностью строится на тегах."
    >
      <section className="glass rounded-lg border p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="display-font text-2xl font-semibold">Список счетов</h3>
            <p className="text-sm text-[rgb(var(--muted))]">
              Активные счета участвуют в новых срезах. Архивные остаются в истории, но не попадают в форму ввода.
            </p>
            <p className="mt-1 text-sm text-[rgb(var(--muted))]">
              Перетаскивание работает через drag-handle и сопровождается анимацией перестановки.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen((current) => !current)}
            className="inline-flex items-center gap-2 rounded bg-[rgb(var(--accent))] px-5 py-2.5 text-sm font-semibold text-[#06070C] transition hover:bg-[rgb(var(--accent)/0.86)]"
          >
            {isCreateOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isCreateOpen ? "Закрыть" : "Добавить счет"}
          </button>
        </div>

        {isCreateOpen ? (
          <div className="mb-4 rounded-lg border p-4">
            <div className="mb-3 text-sm text-[rgb(var(--muted))]">
              Один счет может одновременно находиться в нескольких тегах.
            </div>
            <div className="grid gap-3">
              <input
                value={newAccount.name}
                onChange={(event) => setNewAccount((current) => ({ ...current, name: event.target.value }))}
                placeholder="Название счета"
                className="ui-field"
              />
              <select
                value={newAccount.currency}
                onChange={(event) => setNewAccount((current) => ({ ...current, currency: event.target.value }))}
                className="ui-field"
              >
                <optgroup label="Фиатные валюты">
                  {fiatCurrencyOptions.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Криптовалюты">
                  {cryptoCurrencyOptions.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </optgroup>
              </select>
              <div className="ui-card px-3 py-2">
                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[rgb(var(--muted))]">Теги</div>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag) => {
                    const selected = newAccount.tagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() =>
                          setNewAccount((current) => ({
                            ...current,
                            tagIds: selected
                              ? current.tagIds.filter((id) => id !== tag.id)
                              : [...current.tagIds, tag.id]
                          }))
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
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => {
                    resetCreateForm();
                    setIsCreateOpen(false);
                  }}
                  className="rounded border px-4 py-2 text-sm transition hover:border-slate-400/60"
                >
                  Отмена
                </button>
                <button
                  onClick={addAccount}
                  className="inline-flex items-center gap-2 rounded bg-[rgb(var(--accent))] px-5 py-2.5 text-sm font-semibold text-[#06070C] transition hover:bg-[rgb(var(--accent)/0.86)]"
                >
                  <Plus className="h-4 w-4" />
                  Создать счет
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <DndContext
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={data.accounts.map((account) => account.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {data.accounts.map((account) => {
                const isEditing = editingAccountId === account.id && editingDraft;
                return (
                  <SortableAccountCard
                    key={account.id}
                    account={account}
                    tags={data.tags}
                    isEditing={Boolean(isEditing)}
                    editingDraft={isEditing ? editingDraft : null}
                    onStartEditing={startEditing}
                    onCancelEditing={cancelEditing}
                    onSaveEditing={saveEditing}
                    onToggleAccount={toggleAccount}
                    onChangeEditingDraft={setEditingDraft}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </section>
    </AppShell>
  );
}

function SortableAccountCard({
  account,
  tags,
  isEditing,
  editingDraft,
  onStartEditing,
  onCancelEditing,
  onSaveEditing,
  onToggleAccount,
  onChangeEditingDraft
}: {
  account: Account;
  tags: { id: string; name: string }[];
  isEditing: boolean;
  editingDraft: AccountDraft | null;
  onStartEditing: (accountId: string) => void;
  onCancelEditing: () => void;
  onSaveEditing: () => void;
  onToggleAccount: (accountId: string) => void;
  onChangeEditingDraft: Dispatch<SetStateAction<AccountDraft | null>>;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: account.id,
    disabled: isEditing,
    transition: {
      duration: 180,
      easing: "cubic-bezier(0.2, 0, 0, 1)"
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : "auto"
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "rounded-lg border p-4 transition-[box-shadow,border-color,opacity,transform] duration-200",
        isDragging ? "border-[rgb(var(--accent)/0.7)] opacity-70 shadow-xl shadow-black/30" : "hover:border-[rgb(var(--line))]"
      )}
    >
      {isEditing && editingDraft ? (
        <div className="space-y-3">
          <input
            value={editingDraft.name}
            onChange={(event) =>
              onChangeEditingDraft((current) => (current ? { ...current, name: event.target.value } : current))
            }
            className="ui-field w-full"
          />
          <select
            value={editingDraft.currency}
            onChange={(event) =>
              onChangeEditingDraft((current) => (current ? { ...current, currency: event.target.value } : current))
            }
            className="ui-field w-full"
          >
            <optgroup label="Фиатные валюты">
              {fiatCurrencyOptions.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </optgroup>
            <optgroup label="Криптовалюты">
              {cryptoCurrencyOptions.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </optgroup>
          </select>
          <div className="ui-card px-3 py-2">
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[rgb(var(--muted))]">Теги</div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const selected = editingDraft.tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      onChangeEditingDraft((current) =>
                        current
                          ? {
                              ...current,
                              tagIds: selected
                                ? current.tagIds.filter((id) => id !== tag.id)
                                : [...current.tagIds, tag.id]
                            }
                          : current
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
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              onClick={() => onToggleAccount(account.id)}
              className={clsx(
                "rounded border px-4 py-2 text-sm transition",
                account.isActive
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-slate-400/30 text-[rgb(var(--muted))]"
              )}
            >
              {account.isActive ? "Активный" : "В архиве"}
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onSaveEditing}
                className="rounded border border-[rgb(var(--accent)/0.65)] bg-[rgb(var(--accent)/0.12)] px-4 py-2 text-sm text-[rgb(var(--text))] transition hover:bg-[rgb(var(--accent)/0.2)] dark:text-[rgb(var(--text))]"
              >
                Сохранить
              </button>
              <button
                onClick={onCancelEditing}
                className="rounded border px-3 py-2 text-sm transition hover:border-rose-400/60 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                type="button"
                className="cursor-grab touch-none rounded border p-2 text-[rgb(var(--muted))] transition hover:border-[rgb(var(--accent)/0.55)] hover:bg-[rgb(var(--accent)/0.12)] hover:text-[rgb(var(--text))] active:cursor-grabbing dark:hover:text-[rgb(var(--text))]"
                aria-label={`Переместить счет ${account.name}`}
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <span className="rounded bg-white/5 p-2">
                <WalletCards className="h-4 w-4" />
              </span>
              <div>
                <div className="font-medium">{account.name}</div>
                <div className="text-sm text-[rgb(var(--muted))]">{account.currency}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onToggleAccount(account.id)}
                className={clsx(
                  "rounded border px-4 py-2 text-sm transition",
                  account.isActive
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-slate-400/30 text-[rgb(var(--muted))]"
                )}
              >
                {account.isActive ? "Активный" : "В архиве"}
              </button>
              <button
                onClick={() => onStartEditing(account.id)}
                className="rounded border px-3 py-2 text-sm transition hover:border-[rgb(var(--accent)/0.55)] hover:bg-[rgb(var(--accent)/0.12)] hover:text-[rgb(var(--text))] dark:hover:text-[rgb(var(--text))]"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {getAccountTagIds(account).map((tagId) => {
              const tag = tags.find((item) => item.id === tagId);
              if (!tag) return null;

              return (
                <span key={tag.id} className="rounded border px-3 py-1 text-xs text-[rgb(var(--muted))]">
                  {tag.name}
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

