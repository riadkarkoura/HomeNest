import { getFeaturedProducts } from "@/lib/supabase/queries/products";
import HeroSection from "@/components/home/HeroSection";
import AIConsultantSection from "@/components/home/AIConsultantSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ShopByProblemSection from "@/components/home/ShopByProblemSection";
import MarqueeSection from "@/components/home/MarqueeSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedSection from "@/components/home/FeaturedSection";
import CraftSection from "@/components/home/CraftSection";
import TestimonialSection from "@/components/home/TestimonialSection";
import NewsletterSection from "@/components/home/NewsletterSection";

// Sprint 9.3: reordered per docs/LANDING_PAGE_EXPERIENCE.md's approved
// information architecture -- the AI Consultant now leads (right after
// Hero) instead of sitting mid-page, and Philosophy's mission statement
// was folded into the new How It Works section instead of standing alone.
export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      <HeroSection />
      <AIConsultantSection />
      <HowItWorksSection />
      <MarqueeSection />
      <ShopByProblemSection />
      <CategorySection />
      <FeaturedSection products={featured} />
      <CraftSection />
      <TestimonialSection />
      <NewsletterSection />
    </>
  );
}
