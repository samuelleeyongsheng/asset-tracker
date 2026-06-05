"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/*
  When a Google sign-in collides with an existing email/password account,
  better-auth can't link them, so it redirects to our errorCallbackURL ("/")
  with ?error=account_not_linked. This component reads that param on the landing
  page, shows a friendly warning, then strips the param from the URL so a
  refresh doesn't replay the toast.
*/

// Map better-auth's error codes -> human messages. Add more codes here as needed.
const ERROR_MESSAGES: Record<string, string> = {
  account_not_linked:
    "That email already registered. Please sign in with your email and password instead of Google.",
};

export function AuthErrorToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  useEffect(() => {
    if (!error) return;

    toast.warning(ERROR_MESSAGES[error] ?? "We couldn't sign you in. Please try again.");

    // Remove ?error=... so refreshing or sharing the URL doesn't re-trigger it.
    router.replace("/", { scroll: false });
  }, [error, router]);

  return null;
}
