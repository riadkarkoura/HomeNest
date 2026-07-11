import { ImagePlus, Film } from "lucide-react";
import StudioSection from "../StudioSection";

function Dropzone({ icon: Icon, label, hint }: { icon: React.ElementType; label: string; hint: string }) {
  return (
    <div className="group flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 px-6 py-12 text-center transition-colors hover:border-amber-300 hover:bg-amber-50/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm transition-colors group-hover:bg-amber-100">
        <Icon className="h-5 w-5 text-stone-400 transition-colors group-hover:text-amber-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-stone-700">{label}</p>
        <p className="mt-0.5 text-xs text-stone-400">{hint}</p>
      </div>
      <span className="mt-1 inline-flex items-center rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-stone-400">
        Drag &amp; drop coming soon
      </span>
    </div>
  );
}

export default function MediaSection() {
  return (
    <StudioSection icon={ImagePlus} title="Media" description="Upload lands in a future sprint — placeholders for now.">
      <Dropzone icon={ImagePlus} label="Drag and drop images" hint="PNG or JPG, up to 5MB" />
      <Dropzone icon={Film} label="Drag and drop a video" hint="MP4, up to 50MB" />
    </StudioSection>
  );
}
