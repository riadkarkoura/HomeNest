"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset, type RequestResetState } from "./actions";

const initialState: RequestResetState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-semibold text-stone-900">
            Home<span className="text-amber-600">Nest</span>
          </Link>
          <p className="mt-2 text-sm text-stone-500">Reset your password</p>
        </div>

        {state.sent ? (
          <div className="space-y-4 rounded-2xl border border-stone-100 bg-white p-6 text-center">
            <MailCheck className="mx-auto h-8 w-8 text-amber-600" />
            <p className="text-sm text-stone-600">
              If an account exists for that email, a reset link is on its way.
            </p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 rounded-2xl border border-stone-100 bg-white p-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-stone-700">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="mt-1.5"
                autoComplete="email"
                required
              />
            </div>

            {state.error && <p className="text-sm text-destructive">{state.error}</p>}

            <Button
              type="submit"
              disabled={pending}
              className="w-full gap-2 bg-stone-900 py-5 text-base text-white hover:bg-amber-700"
            >
              {pending ? "Sending…" : "Send Reset Link"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-stone-500 hover:text-stone-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
