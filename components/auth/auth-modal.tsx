"use client";

import { useRouter } from "next/navigation";

import { useAuthModal } from "./auth-modal-provider";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";
import Modal from "@/components/ui/Modal";

export function AuthModal() {
  const { isOpen, view, closeAuthModal, switchView } = useAuthModal();
  const router = useRouter();
  const isLogin = view === "login";

  function handleSuccess() {
    closeAuthModal();
    // refresh() re-runs server components so the navbar/session reflect the new
    // logged-in state; push() sends them into the app.
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Modal open={isOpen} onClose={closeAuthModal}>
      <div>
        {isLogin ? (
          <LoginForm onSwitchView={switchView} onSuccess={handleSuccess} />
        ) : (
          <SignupForm onSwitchView={switchView} onSuccess={handleSuccess} />
        )}
      </div>
    </Modal>
  );
}
