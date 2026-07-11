import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

export const metadata: Metadata = { title: "Analytics" };

export default function AdminAnalyticsPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-600 mb-1">Intelligence</p>
        <h1 className="text-2xl font-semibold text-stone-900">Analytics</h1>
        <p className="text-sm text-stone-500 mt-0.5">Track sales, traffic, and product performance.</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white py-24 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
          <BarChart3 className="h-7 w-7 text-stone-400" />
        </div>
        <p className="text-sm font-medium text-stone-900">Analytics coming soon</p>
        <p className="mt-1 text-xs text-stone-400">Detailed reporting and insights will be available in a future sprint.</p>
      </div>
    </div>
  );
}
