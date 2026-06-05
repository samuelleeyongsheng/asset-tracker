"use client"

import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { GoogleIcon } from "./ui/google-icon"
import { cn } from "@/lib/utils"
import { signIn } from "@/lib/auth-client"
import { loginSchema } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type LoginFormProps = React.ComponentProps<"div"> & {
  // The modal passes these in so the form can flip to signup or close on success.
  onSwitchView?: () => void
  onSuccess?: () => void
}

// Field name -> error message. We only ever store the fields this form has.
type FieldErrors = Partial<Record<"email" | "password", string>>

export function LoginForm({
  className,
  onSwitchView,
  onSuccess,
  ...props
}: LoginFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  async function handleGoogle() {
    setIsGoogleLoading(true)
    try {
      // This kicks off a full-page redirect to Google. On success, Google sends
      // the user back to /api/auth/callback/google, which sets the cookie and
      // then forwards them to callbackURL. There's no JSON result to await here,
      // so we don't toast/onSuccess — the browser simply navigates away.
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard", // where the user lands after Google approves
        errorCallbackURL: "/", // where they land if Google denies / errors
      })
    } catch (err) {
      // Only reached if we never even got redirected (e.g. network down).
      console.error(err)
      toast.error("Couldn't reach Google. Please try again.")
      setIsGoogleLoading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Stop the browser's default full-page form submit — we handle it in JS.
    event.preventDefault()

    // FormData reads the current values straight off the DOM inputs (by `name`),
    // so we don't need a piece of state per field.
    const formData = new FormData(event.currentTarget)
    const values = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    }

    // safeParse never throws — it returns success/error so we can branch cleanly.
    const result = loginSchema.safeParse(values)
    if (!result.success) {
      // z.flattenError gives { fieldErrors: { email: [msg], password: [msg] } }.
      const { fieldErrors } = z.flattenError(result.error)
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      })
      return
    }

    // Validation passed — clear old errors and call better-auth.
    setErrors({})
    setIsSubmitting(true)

    try {
      // better-auth returns { data, error } for *auth* failures (wrong password).
      // But a network/500 error THROWS — so we still need the try/catch below.
      const { error } = await signIn.email({
        email: result.data.email,
        password: result.data.password,
      })

      if (error) {
        toast.error(error.message ?? "Invalid email or password")
        return
      }

      toast.success("Welcome back!")
      onSuccess?.()
    } catch (err) {
      // Reaches here if the request itself failed (server 500, network down).
      console.error(err)
      toast.error("Something went wrong. Please try again.")
    } finally {
      // finally ALWAYS runs — success, handled error, or throw — so the button
      // can never get stuck on "Logging in...".
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* noValidate disables the browser's native bubbles so zod is the
              only source of validation messages. */}
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  aria-invalid={!!errors.email}
                />
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>
              <Field data-invalid={!!errors.password}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  aria-invalid={!!errors.password}
                />
                {errors.password && <FieldError>{errors.password}</FieldError>}
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogle}
                  disabled={isGoogleLoading}
                >
                  <GoogleIcon/>
                  {isGoogleLoading ? "Redirecting..." : "Login with Google"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchView}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign up
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
