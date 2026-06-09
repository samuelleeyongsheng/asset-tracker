"use client"

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { authClient } from "@/lib/auth-client";
import { AuthTriggerButton } from "@/components/auth/auth-trigger-button";


export default function Navbar() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const user = session?.user;
    
    async function handleLogout() {
        await authClient.signOut();
        router.push("/");        // send them home after logout
        router.refresh();        // re-fetch server components with no session
    }

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-14
                    border-b border-border bg-background/85 backdrop-blur-md">
            {/* Asset-Track App */}
            <div className="flex items-center">
                <span className="font-bold text-[20px] tracking-tight text-foreground hover:opacity-70">
                    <a href="/">
                    📊Asset<span className="text-emerald-600 dark:text-emerald-400">Track</span>
                    </a>
                </span>
            </div> 

             {/* Log In/ Sign Up button */}
             <div className="flex items-center gap-2">
                {isPending ? (
                    // while checking session: a neutral placeholder (avoids flicker)
                    <div className="w-16 h-7 rounded-md bg-muted" />
                ) : user ? (
                    
                    <>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-md border
                                        border-border bg-muted text-sm font-medium text-foreground">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center
                                            bg-emerald-600 dark:bg-emerald-500 text-white text-[10px] font-bold shrink-0">
                                {user.name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            {user.name}
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            Log out
                        </Button>
                    </>
                ) : (
                    <>
                        <AuthTriggerButton view="login" variant="ghost" size="lg" />
                        <AuthTriggerButton view="signup" variant="default" size="lg" />
                    </>

                )}
                <ThemeToggle />
             </div> 
        </nav>
    );
}