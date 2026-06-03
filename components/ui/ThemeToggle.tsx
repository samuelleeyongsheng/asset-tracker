"use client"

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch, only render icon after mount, else button not working
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <button
                disabled
                aria-label="Toggle theme"
                className="w-9 h-9 flex items-center justify-center
                        rounded-lg border border-border bg-muted"
            />
        )
    } 

    return (
        <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="w-9 h-9 flex items-center justify-center rounded-lg border
                 border-border bg-muted hover:bg-accent hover:text-accent-foreground
                 transition-colors duration-150 cursor-pointer text-base"
        >
            {resolvedTheme === "dark"
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />
            }
        </button>
    );
}