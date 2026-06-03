import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

// API gateway
export const { POST, GET } = toNextJsHandler(auth);