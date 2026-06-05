import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle"; // your drizzle instance
import { nextCookies } from "better-auth/next-js";
import { schema } from "@/db/schema";


// auth.ts is like an authentication engine (server-side service)
// handle every operation: sign in, sign up, session check, password hash

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
    },
    // OAuth providers. better-auth reads BETTER_AUTH_URL from .env to build the
    // callback URL (http://localhost:3000/api/auth/callback/google), so the app
    // must run on the same port you registered in Google Cloud Console.
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema,
    }),
    plugins: [nextCookies()],
});