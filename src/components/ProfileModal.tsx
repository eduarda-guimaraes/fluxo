"use client";

import { useState } from "react";
import { updateUserName, deleteUserAccount } from "@/firebase/auth";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";

type ProfileModalProps = {
  user: User;
  isOpen: boolean;
  onClose: () => void;
};

export function ProfileModal({ user, isOpen, onClose }: ProfileModalProps) {
  const router = useRouter();
  const [name, setName] = useState(user.displayName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      await updateUserName(name);
      setMessage("Perfil atualizado com sucesso!");
      setTimeout(() => {
        onClose();
        window.location.reload(); 
      }, 1500);
    } catch (err: any) {
      setError("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setError("");
    try {
      await deleteUserAccount();
      onClose();
      router.push("/login");
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        setError("Para sua segurança, saia e entre novamente antes de excluir sua conta.");
      } else {
        setError("Erro ao excluir conta. Tente novamente.");
      }
      setShowConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm px-6">
      <div className="w-full max-w-md rounded-3xl border border-border-soft bg-surface p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Configurações de Perfil</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              E-mail
            </label>
            <input
              type="email"
              disabled
              value={user.email || ""}
              className="w-full rounded-xl border border-border-soft bg-zinc-50 px-4 py-3 text-sm text-zinc-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="edit-name" className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Nome de exibição
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full rounded-xl border border-border-soft bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-mint-strong transition"
            />
          </div>

          {message && (
            <p className="text-sm font-medium text-mint-strong">{message}</p>
          )}
          {error && (
            <p className="text-sm font-medium text-coral">{error}</p>
          )}

          {!showConfirmDelete && (
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm font-semibold text-foreground hover:bg-background transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="flex-1 rounded-xl bg-mint-strong px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-mint-strong/20 hover:bg-mint transition disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          )}
        </form>

        <div className="mt-10 border-t border-border-soft pt-6">
          <h3 className="text-sm font-semibold text-coral uppercase tracking-wider">Zona de Perigo</h3>
          <p className="mt-1 text-xs text-zinc-500">
            A exclusão da conta é permanente e não pode ser desfeita.
          </p>

          {!showConfirmDelete ? (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="mt-4 text-sm font-semibold text-coral hover:underline"
            >
              Excluir minha conta permanentemente
            </button>
          ) : (
            <div className="mt-4 rounded-2xl bg-coral/5 p-4 border border-coral/10">
              <p className="text-sm font-medium text-foreground">Tem certeza absoluta?</p>
              <p className="mt-1 text-xs text-zinc-600">Isso apagará todos os seus dados e transações.</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 rounded-lg border border-border-soft bg-surface py-2 text-xs font-semibold text-foreground transition hover:bg-background"
                >
                  Não, manter conta
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteAccount}
                  className="flex-1 rounded-lg bg-coral py-2 text-xs font-semibold text-white transition hover:bg-opacity-90 disabled:opacity-50"
                >
                  {isDeleting ? "Excluindo..." : "Sim, excluir conta"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
