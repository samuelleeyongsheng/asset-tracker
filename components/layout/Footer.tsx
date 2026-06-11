import Link from "next/link";

export default function Footer() {
    return(
        <footer className="border-t border-border bg-muted/80 px-6 py-4
                       flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-foreground hover:opacity-70">
                        <Link href="/">📊Asset<span className="text-emerald-600 dark:text-emerald-400">Track</span></Link>
                    </span>
                <span className="text-muted-foreground">© {new Date().getFullYear()} Asset Portfolio Tracker</span>
            </div>

            <p className="text-xs text-muted-foreground">
                Contact :{" "} 
                <a
                    href="mailto:samuelleeyongsheng8@gmail.com"
                    className="text-foreground 
                                hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                     samuelleeyongsheng8@gmail.com
                </a>
            </p>
        </footer>
    );
}