import { ImagePlus, Film } from "lucide-react";
import StudioSection from "../StudioSection";

function Dropzone({ icon: Icon, label, hint }: { icon: React.ElementType; label: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
        <Icon className="h-4 w-4 text-stone-400" />
      </div>
      <p className="text-sm font-medium text-stone-600">{label}</p>
      <p className="text-xs text-stone-400">{hint}</p>
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
