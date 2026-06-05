"use client"

import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { GoogleIcon } from "./ui/google-icon"
import { signIn, signUp } from "@/lib/auth-client"
import { signupSchema } from "@/lib/validations/auth"
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

type SignupFormProps = React.ComponentProps<typeof Card> & {
  // The modal passes these in so the form can flip to login or close on success.
  onSwitchView?: () => void
  onSuccess?: () => void
}

type FieldName = "name" | "email" | "password" | "confirmPassword"
type FieldErrors = Partial<Record<FieldName, string>>

export function SignupForm({
  onSwitchView,
  onSuccess,
  ...props
}: SignupFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  async function handleGoogle() {
    setIsGoogleLoading(true)
    try {
      // Signing up "with Google" is the same call as signing in — OAuth creates
      // the account automatically if it doesn't exist yet. Full-page redirect,
      // so no toast/onSuccess here; the browser navigates away to Google.
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        errorCallbackURL: "/",
      })
    } catch (err) {
      console.error(err)
      toast.error("Couldn't reach Google. Please try again.")
      setIsGoogleLoading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const values = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    }

    const result = signupSchema.safeParse(values)
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error)
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      })
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      // better-auth needs name + email + password to create the user.
      // We don't send confirmPassword — it only exists to validate on the client.
      const { error } = await signUp.email({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      })

      if (error) {
        toast.error(error.message ?? "Could not create your account")
        return
      }

      toast.success("Account created — welcome!")
      onSuccess?.()
    } catch (err) {
      // Reaches here if the request itself failed (server 500, network down).
      console.error(err)
      toast.error("Something went wrong. Please try again.")
    } finally {
      // finally ALWAYS runs, so the button can't get stuck on "Creating account...".
      setIsSubmitting(false)
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                aria-invalid={!!errors.email}
              />
              {errors.email ? (
                <FieldError>{errors.email}</FieldError>
              ) : (
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
              )}
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                aria-invalid={!!errors.password}
              />
              {errors.password ? (
                <FieldError>{errors.password}</FieldError>
              ) : (
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              )}
            </Field>
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword ? (
                <FieldError>{errors.confirmPassword}</FieldError>
              ) : (
                <FieldDescription>Please confirm your password.</FieldDescription>
              )}
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogle}
                  disabled={isGoogleLoading}
                >
                  <GoogleIcon/>
                  {isGoogleLoading ? "Redirecting..." : "Sign up with Google"}
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchView}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign in
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
