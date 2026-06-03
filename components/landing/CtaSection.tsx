"use client";

import { AuthTriggerButton } from "@/components/auth/auth-trigger-button";

export default function CtaSection() {

  return (
    <section className="max-w-lg mx-auto px-6 pb-20">
      <div className="bg-card border border-border rounded-4xl p-10 text-center shadow-lg">
        <h2 className="text-[26px] font-bold tracking-tight text-card-foreground mb-2">
          Ready to get started?
        </h2>
        <p className="text-base text-muted-foreground mb-6">
          Join thousands of investors tracking their portfolios with AssetTrack.
        </p>
        <AuthTriggerButton view="signup" variant="default" size="lg">
          Create free account →
        </AuthTriggerButton>
      </div>
    </section>
  );
}