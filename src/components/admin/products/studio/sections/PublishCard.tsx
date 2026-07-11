import { CalendarClock } from "lucide-react";

export default function PublishCard() {
  return (
    <section className="rounded-2xl border border-stone-100 bg-white p-6">
      <h2 className="text-sm font-semibold text-stone-900">Publish</h2>
      <p className="mt-0.5 text-xs text-stone-400">Available once product CRUD ships in Sprint 7.</p>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          disabled
          className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Publish
        </button>
        <button
          type="button"
          disabled
          className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save as Draft
        </button>
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-stone-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CalendarClock className="h-3.5 w-3.5" />
          Schedule
        </button>
      </div>
    </section>
  );
}
