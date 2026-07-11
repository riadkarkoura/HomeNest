import { getFeaturedProducts } from "@/lib/products";
import HeroSection from "@/components/home/HeroSection";
import SmartSearchSection from "@/components/home/SmartSearchSection";
import ShopByProblemSection from "@/components/home/ShopByProblemSection";
import MarqueeSection from "@/components/home/MarqueeSection";
import PhilosophySection from "@/components/home/PhilosophySection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedSection from "@/components/home/FeaturedSection";
import CraftSection from "@/components/home/CraftSection";
import TestimonialSection from "@/components/home/TestimonialSection";
import NewsletterSection from "@/components/home/NewsletterSection";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      <HeroSection />
      <SmartSearchSection />
      <ShopByProblemSection />
      <MarqueeSection />
      <PhilosophySection />
      <CategorySection />
      <FeaturedSection products={featured} />
      <CraftSection />
      <TestimonialSection />
      <NewsletterSection />
    </>
  );
}
