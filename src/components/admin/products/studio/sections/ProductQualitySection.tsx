import { Type, AlignLeft, Search, ImagePlus, Gauge } from "lucide-react";
import StudioSection from "../StudioSection";
import ScoreCard from "../ScoreCard";

const TILES = [
  { icon: Type, label: "Title" },
  { icon: AlignLeft, label: "Description" },
  { icon: Search, label: "SEO" },
  { icon: ImagePlus, label: "Images" },
  { icon: Gauge, label: "Overall" },
];

export default function ProductQualitySection() {
  return (
    <StudioSection
      icon={Gauge}
      title="Product Quality"
      description="Live scoring arrives with the AI Assistant in Sprint 9 — placeholders for now."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {TILES.map(({ icon, label }) => (
          <ScoreCard key={label} icon={icon} label={label} />
        ))}
      </div>
    </StudioSection>
  );
}
