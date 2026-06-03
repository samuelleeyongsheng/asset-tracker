import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle"; // your drizzle instance
import { nextCookies } from "better-auth/next-js";

// auth.ts is like an authentication engine (server-side service)
// handle every operation: sign in, sign up, session check, password hash

export const auth = betterAuth({
    emailAndPassword: { 
    enabled: true, 
    },
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
    }),
    plugins: [nextCookies()],
});