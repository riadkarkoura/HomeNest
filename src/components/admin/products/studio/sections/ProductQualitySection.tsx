import { Type, AlignLeft, Search, ImagePlus, Gauge } from "lucide-react";
import StudioSection from "../StudioSection";
import ScoreCard from "../ScoreCard";
import { computeProductQualityScores } from "../scoring";
import type { ProductDraft } from "../types";

interface Props {
  draft: ProductDraft;
}

export default function ProductQualitySection({ draft }: Props) {
  const scores = computeProductQualityScores(draft);

  const tiles = [
    { icon: Type, label: "Title", score: scores.title },
    { icon: AlignLeft, label: "Description", score: scores.description },
    { icon: Search, label: "SEO", score: scores.seo },
    { icon: ImagePlus, label: "Images", score: scores.images },
    { icon: Gauge, label: "Overall", score: scores.overall },
  ];

  return (
    <StudioSection
      icon={Gauge}
      title="Product Quality"
      description="Updates as you fill in the form below. AI-assisted content scoring arrives in Sprint 9."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map(({ icon, label, score }) => (
          <ScoreCard key={label} icon={icon} label={label} score={score} />
        ))}
      </div>
    </StudioSection>
  );
}
