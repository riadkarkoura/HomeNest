import { Check } from "lucide-react";

export interface CheckoutStep {
  label: string;
  complete: boolean;
}

// Visual progress guidance only (Sprint 8.1) -- no navigation, no routing,
// no click handlers between steps. The checkout flow stays the single-page,
// stacked-section layout Sprint 8.0 shipped; this just tells the customer
// what's left without introducing a wizard.
export default function CheckoutSteps({ steps }: { steps: CheckoutStep[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mb-6">
      {steps.map((step, i) => (
        <li key={step.label} className="flex items-center gap-2">
          <span
            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
              step.complete ? "bg-amber-600 text-white" : "bg-stone-200 text-stone-500"
            }`}
          >
            {step.complete ? <Check className="h-3 w-3" /> : i + 1}
          </span>
          <span className={step.complete ? "text-stone-900 font-medium" : "text-stone-400"}>
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
