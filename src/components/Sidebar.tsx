"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/context/DashboardContext";
import { ProfileModal } from "@/components/ProfileModal";
import { ConfirmModal } from "@/components/ConfirmModal";
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full rounded-md border border-border-soft bg-surface px-4 py-2 text-sm font-semibold text-coral transition-colors hover:bg-coral/5 cursor-pointer text-center"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="sticky top-0 z-10 border-b border-border-soft bg-surface/95 px-5 py-4 backdrop-blur lg:hidden flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/favicon.ico"
              alt="Fluxo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg"
            />
            <span className="font-semibold text-foreground">Fluxo</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="rounded-md border border-border-soft bg-background p-2 text-zinc-600 transition-colors hover:bg-surface-muted cursor-pointer"
              title="Editar Perfil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="rounded-md border border-border-soft bg-background p-2 text-coral transition-colors hover:bg-coral/5 cursor-pointer"
              title="Sair"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
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

      <ConfirmModal
        open={isLogoutModalOpen}
        title="Deseja sair da conta?"
        description="Você precisará fazer login novamente para acessar suas finanças."
        confirmLabel="Sair"
        onConfirm={logout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
