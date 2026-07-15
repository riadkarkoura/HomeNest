// Static delivery-option config for Sprint 8.0 (ADR-022) -- deliberately not
// a DB table. Revisit only if the business needs admin-configurable
// rates/zones (Phase 3 "Global scale" territory), not before.

export interface ShippingOption {
  id: string;
  label: string;
  description: string;
  cost: number;
  etaDays: string;
}

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "standard",
    label: "Standard Delivery",
    description: "Arrives in 4–6 business days",
    cost: 0,
    etaDays: "4–6 business days",
  },
  {
    id: "express",
    label: "Express Delivery",
    description: "Arrives in 1–2 business days",
    cost: 12,
    etaDays: "1–2 business days",
  },
];

export const DEFAULT_SHIPPING_OPTION_ID = "standard";

export function getShippingOption(id: string): ShippingOption | undefined {
  return SHIPPING_OPTIONS.find((option) => option.id === id);
}
