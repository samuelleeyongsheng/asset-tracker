"use client";

import { Button } from "@/components/ui/button";

export default function CtaSection() {
  const { user, openModal } = useAuth();

  if (user) return null;

  return (
    <section className="max-w-lg mx-auto px-6 pb-20">
      <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-lg">
        <h2 className="text-[22px] font-bold tracking-tight text-card-foreground mb-2">
          Ready to get started?
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Join thousands of investors tracking their portfolios with AssetTrack.
        </p>
        <Button variant="default" size="lg" onClick={() => openModal("signup")}>
          Create free account →
        </Button>
      </div>
    </section>
  );
}