"use client"

import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

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
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
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
