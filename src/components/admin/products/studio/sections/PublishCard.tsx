import { CalendarClock } from "lucide-react";

interface Props {
  onSaveDraft: () => void | Promise<void>;
  onPublish: () => void | Promise<void>;
  pending: boolean;
  message?: string;
}

export default function PublishCard({ onSaveDraft, onPublish, pending, message }: Props) {
  return (
    <section className="rounded-2xl border border-stone-100 bg-white p-6">
      <h2 className="text-sm font-semibold text-stone-900">Publish</h2>
      <p className="mt-0.5 text-xs text-stone-400">Scheduling arrives in a future sprint.</p>

      {message && <p className="mt-3 text-xs text-destructive">{message}</p>}

      <form className="mt-4 space-y-2">
        <button
          type="submit"
          formAction={onSaveDraft}
          disabled={pending}
          className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save as Draft"}
        </button>
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-stone-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CalendarClock className="h-3.5 w-3.5" />
          Schedule
        </button>
        <button
          type="submit"
          formAction={onPublish}
          disabled={pending}
          className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Publishing…" : "Publish"}
        </button>
      </form>
    </section>
  );
}
