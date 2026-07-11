import type { ReactNode } from "react";

interface Props {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function StudioSection({ icon: Icon, title, description, children, className = "" }: Props) {
  return (
    <section className={`rounded-2xl border border-stone-100 bg-white ${className}`}>
      <div className="flex items-start gap-3 border-b border-stone-100 px-6 py-5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-stone-100">
          <Icon className="h-4 w-4 text-stone-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-stone-400">{description}</p>}
        </div>
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  );
}
