import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export default function FormField({ label, htmlFor, hint, required, children, className = "" }: Props) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={htmlFor} className="text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-amber-600"> *</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-stone-400">{hint}</p>}
    </div>
  );
}
