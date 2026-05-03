"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/context/DashboardContext";
import { ProfileModal } from "@/components/ProfileModal";
import { currencyFormatter } from "@/utils/finance";

const navigationItems = [
  { label: "Início", href: "/dashboard" },
  { label: "Gráficos", href: "/dashboard/charts" },
  { label: "Transações", href: "/dashboard/transactions" },
  { label: "Cartões", href: "/dashboard/cards" },
  { label: "Caixinhas", href: "/dashboard/savings" },
];

export function Sidebar() {
  const { user } = useAuth();
  const { balance } = useDashboard();
  const pathname = usePathname();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-border-soft bg-surface px-6 py-6 shadow-[18px_0_60px_rgba(80,58,39,0.06)] lg:flex">
        <div className="flex items-center gap-3">
          <Image
            src="/favicon.ico"
            alt="Fluxo"
            width={48}
            height={48}
            className="h-12 w-12 rounded-2xl"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lavender">
              Fluxo
            </p>
            <h1 className="text-xl font-semibold text-foreground">Finanças</h1>
          </div>
        </div>

        <nav className="mt-10 flex flex-col gap-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-mint-strong text-white shadow-[0_10px_24px_rgba(85,189,169,0.20)]"
                    : "text-zinc-600 hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isActive ? "bg-white" : "bg-lavender"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-10 rounded-lg border border-border-soft bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lavender">
            Saldo disponível
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {currencyFormatter.format(balance)}
          </p>
        </div>

        <div className="mt-auto rounded-lg border border-border-soft bg-background p-4">
          <p className="text-sm font-semibold text-foreground">
            {user.displayName ?? "Usuario"}
          </p>
          <p className="mt-1 truncate text-xs text-zinc-500">{user.email}</p>
          
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="w-full rounded-md border border-border-soft bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted cursor-pointer text-center"
            >
              Editar Perfil
            </button>
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-md border border-border-soft bg-surface px-4 py-2 text-sm font-semibold text-coral transition-colors hover:bg-coral/5 cursor-pointer text-center"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="sticky top-0 z-10 border-b border-border-soft bg-surface/95 px-5 py-4 backdrop-blur lg:hidden">
        <nav className="flex gap-2 overflow-x-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold ${
                  isActive
                    ? "bg-mint-strong text-white"
                    : "bg-background text-zinc-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <ProfileModal 
        user={user} 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
}
