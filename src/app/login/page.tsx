"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { signup, login, type AuthState } from "./actions";

const initialState: AuthState = {};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [signupState, signupAction, signupPending] = useActionState(signup, initialState);
  const [loginState, loginAction, loginPending] = useActionState(login, initialState);

  const state = isRegister ? signupState : loginState;
  const formAction = isRegister ? signupAction : loginAction;
  const pending = isRegister ? signupPending : loginPending;

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1200&q=80"
          alt="Elegant interior"
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900/80 to-stone-900/40" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <Link href="/" className="text-2xl font-semibold text-white mb-auto self-start">
            Home<span className="text-amber-400">Nest</span>
          </Link>
          <blockquote className="text-white">
            <p className="text-2xl font-light leading-relaxed mb-4">
              &ldquo;Your home is your canvas. Every piece you choose tells your story.&rdquo;
            </p>
            <footer className="text-stone-300 text-sm">— HomeNest Design Philosophy</footer>
          </blockquote>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Link href="/" className="text-2xl font-semibold text-stone-900">
              Home<span className="text-amber-600">Nest</span>
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-light text-stone-900">
              {isRegister ? "Create an" : "Welcome"}{" "}
              <span className="font-semibold">{isRegister ? "account" : "back"}</span>
            </h1>
            <p className="text-stone-500 mt-2 text-sm">
              {isRegister
                ? "Join HomeNest and discover your perfect sanctuary"
                : "Sign in to your account to continue"}
            </p>
          </div>

          {/* OAuth buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full py-5 gap-3 border-stone-200"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {isGoogleLoading ? "Redirecting…" : "Continue with Google"}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-stone-400">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Email form */}
          <form action={formAction} className="space-y-4">
            {isRegister && (
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-stone-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jane Doe"
                  className="mt-1.5"
                  autoComplete="name"
                  required
                />
              </div>
            )}
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
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-stone-700">
                  Password
                </Label>
                {!isRegister && (
                  <Link href="/forgot-password" className="text-xs text-amber-600 hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isRegister ? "Create a strong password" : "Enter your password"}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isRegister && (
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
                <Label htmlFor="remember" className="text-sm text-stone-600 cursor-pointer">
                  Remember me for 30 days
                </Label>
              </div>
            )}

            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

            <Button
              type="submit"
              disabled={pending}
              className="w-full bg-stone-900 hover:bg-amber-700 text-white py-5 gap-2 text-base"
            >
              {pending ? "Please wait…" : isRegister ? "Create Account" : "Sign In"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-amber-600 hover:underline font-medium"
            >
              {isRegister ? "Sign in" : "Create one"}
            </button>
          </p>

          <p className="text-xs text-stone-400 text-center">
            By continuing, you agree to our{" "}
            <Link href="#" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
