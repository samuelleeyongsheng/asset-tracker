"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

import { type AuthView, useAuthModal } from "./auth-modal-provider";

type AuthTriggerButtonProps = React.ComponentProps<typeof Button> & {
  view: AuthView;
};

export function AuthTriggerButton({
  view,
  onClick,
  children,
  ...props
}: AuthTriggerButtonProps) {
  const { openAuthModal } = useAuthModal();

  return (
    <Button
      {...props}
      onClick={(event) => {
        onClick?.(event);
        openAuthModal(view);
      }}
    >
      {children ?? (view === "login" ? "Log in" : "Sign up")}
    </Button>
  );
}