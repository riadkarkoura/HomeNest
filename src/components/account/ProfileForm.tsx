"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfile, type ProfileState } from "@/app/account/actions";

interface Props {
  email: string;
  initial: {
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    marketingOptIn: boolean;
  };
}

const initialState: ProfileState = {};

export default function ProfileForm({ email, initial }: Props) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <form
      action={formAction}
      className="bg-white rounded-2xl border border-stone-100 p-6 sm:p-8 space-y-5 max-w-xl"
    >
      <div>
        <Label className="text-sm font-medium text-stone-700">Email Address</Label>
        <Input value={email} disabled className="mt-1.5 bg-stone-50" />
        <p className="text-xs text-stone-400 mt-1.5">Contact support to change your email address.</p>
      </div>

      <div>
        <Label htmlFor="name" className="text-sm font-medium text-stone-700">
          Full Name
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={initial.name}
          required
          className="mt-1.5"
          autoComplete="name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-sm font-medium text-stone-700">
            First Name
          </Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={initial.firstName}
            className="mt-1.5"
            autoComplete="given-name"
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm font-medium text-stone-700">
            Last Name
          </Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={initial.lastName}
            className="mt-1.5"
            autoComplete="family-name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone" className="text-sm font-medium text-stone-700">
          Phone
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initial.phone}
          className="mt-1.5"
          autoComplete="tel"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="marketingOptIn"
          name="marketingOptIn"
          type="checkbox"
          defaultChecked={initial.marketingOptIn}
          className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
        />
        <Label htmlFor="marketingOptIn" className="text-sm text-stone-600 cursor-pointer">
          Email me about new products and offers
        </Label>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-amber-700">Profile updated.</p>}

      <Button
        type="submit"
        disabled={pending}
        className="bg-stone-900 hover:bg-amber-700 text-white gap-2"
      >
        {pending ? "Saving…" : "Save Changes"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
