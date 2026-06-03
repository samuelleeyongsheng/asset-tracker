import { createAuthClient } from "better-auth/react"

/* for client to request auth access to auth.ts 
    also to prevent DB_URL, or important secret expose to public
    so client exist
*/

export const authClient = createAuthClient({
    /** The base URL of the auth.ts server (optional if you're using the same domain) */
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
})

export const { signIn, signUp, useSession } = createAuthClient()