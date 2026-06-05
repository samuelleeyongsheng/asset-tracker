import { z } from "zod";

/*
  Zod schemas are the single source of truth for what "valid" form data looks
  like. We validate on the client for instant feedback, but better-auth also
  validates on the server — never trust the client alone.
*/

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  // .refine runs AFTER the individual field checks pass. It lets us validate a
  // relationship between two fields (password === confirmPassword). `path` tells
  // zod which field the error belongs to, so it shows under "Confirm Password".
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// z.infer derives the TypeScript type from the schema, so the type and the
// validation rules can never drift apart.
export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
