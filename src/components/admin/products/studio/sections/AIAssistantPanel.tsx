import { Sparkles, Download, Search, BookOpen, Video, HelpCircle, Camera } from "lucide-react";

const ACTIONS = [
  { icon: Download, label: "Import from AliExpress" },
  { icon: BookOpen, label: "Generate Product Story" },
  { icon: Search, label: "Generate SEO" },
  { icon: HelpCircle, label: "Generate FAQs" },
  { icon: Video, label: "Generate TikTok Content" },
  { icon: Camera, label: "Generate Product Images" },
];

export default function AIAssistantPanel() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
          <Sparkles className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-stone-900">AI Product Assistant</h2>
          <p className="mt-0.5 text-xs font-medium text-amber-600">Coming in Sprint 9</p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-stone-500">
        Generate SEO, product story copy, and social content from a single source product — powered by Claude.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {ACTIONS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            disabled
            className="flex flex-col items-start gap-2 rounded-lg border border-stone-200 bg-white px-3 py-3 text-left text-xs font-medium text-stone-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon className="h-4 w-4 text-stone-400" />
            <span className="leading-snug">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
