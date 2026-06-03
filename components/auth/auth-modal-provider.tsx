"use client";

import * as React from "react";

export type AuthView = "login" | "signup";

type AuthModalContextValue = {
  isOpen: boolean;
  view: AuthView;
  openAuthModal: (view?: AuthView) => void;
  closeAuthModal: () => void;
  switchView: () => void;
};

const AuthModalContext = React.createContext<AuthModalContextValue | null>(
  null,
);

export function AuthModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [view, setView] = React.useState<AuthView>("login");

  const openAuthModal = React.useCallback((next: AuthView = "login") => {
    setView(next);
    setIsOpen(true);
  }, []);

  const closeAuthModal = React.useCallback(() => setIsOpen(false), []);

  const switchView = React.useCallback(() => {
    setView((v) => (v === "login" ? "signup" : "login"));
  }, []);

  const value = React.useMemo<AuthModalContextValue>(
    () => ({
      isOpen,
      view,
      openAuthModal,
      closeAuthModal,
      switchView,
    }),
    [isOpen, view, openAuthModal, closeAuthModal, switchView],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = React.useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used inside <AuthModalProvider>");
  }
  return ctx;
}
