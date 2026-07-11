"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAdmin, type SignInState } from "./actions";

const initialState: SignInState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(signInAdmin, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-semibold text-stone-900">
            Home<span className="text-amber-600">Nest</span>
          </Link>
          <p className="mt-2 text-sm text-stone-500">Admin sign-in</p>
        </div>

        <form action={formAction} className="space-y-4 rounded-2xl border border-stone-100 bg-white p-6">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-stone-700">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@homenest.com"
              className="mt-1.5"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-stone-700">
              Password
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button
            type="submit"
            disabled={pending}
            className="w-full gap-2 bg-stone-900 py-5 text-base text-white hover:bg-amber-700"
          >
            {pending ? "Signing in…" : "Sign In"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
