"use client";

import { useAuthModal } from "./auth-modal-provider";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";
import Modal from "@/components/ui/Modal";

export function AuthModal() {
  const { isOpen, view, closeAuthModal } = useAuthModal();
  const isLogin = view === "login";

  return (
    <Modal open={isOpen} onClose={closeAuthModal}>
      <div>
        {isLogin ? <LoginForm /> : <SignupForm />}
      </div>
    </Modal>
  );
}