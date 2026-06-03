"use client";

import { Button } from "@/components/ui/button"
import Badge from "@/components/ui/badge"
import { AuthTriggerButton } from "@/components/auth/auth-trigger-button";

export default function Hero() {
    
    return (
        <section className="flex flex-col items-center text-center px-6 pt-20 pb-14 max-w-2xl mx-auto">
            {/* "Free to use" Demo Only */}
            <Badge variant="success" size="lg" icon="✦" className="mb-6">
                Free to use · Demo Only 
            </Badge>

            <h1 className="text-[clamp(28px,5vw,46px)] font-bold tracking-tight leading-[1.15]
                    text-foreground mb-4">
                Asset Portfolio Tracker
            </h1>

            <p className="text-[clamp(15px,2.5vw,19px)] text-muted-foreground leading-relaxed mb-8">
                Track your{" "}
                <Badge variant="crypto" size="md">Crypto</Badge>
                {" "}&{" "}
                <Badge variant="stock" size="md">Stocks</Badge>
                {" "}together
            </p>

            {/* CTAs */}
            <div className="flex gap-3 flex-wrap justify-center mb-4">
                <AuthTriggerButton view="signup" variant="ghost" size="lg">
                    Get started free →
                </AuthTriggerButton>
                <AuthTriggerButton view="login" variant="default" size="lg">
                    Log in
                </AuthTriggerButton>
            </div>

            <p className="text-sm text-muted-foreground">
                Supports BTC · ETH · SOL · AAPL · TSLA · NVDA &amp; many more
            </p>
        </section>
    );
}