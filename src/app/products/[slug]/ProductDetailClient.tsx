"use client";

import { useState, useEffect, useRef } from "react";
import { Product } from "@/types";
import { useCartStore } from "@/lib/store";
import { getProductContent } from "@/lib/product-content";

import ProductHero       from "@/components/product/ProductHero";
import ProblemSection    from "@/components/product/ProblemSection";
import SolutionSection   from "@/components/product/SolutionSection";
import BenefitsSection   from "@/components/product/BenefitsSection";
import GallerySection    from "@/components/product/GallerySection";
import VideoSection      from "@/components/product/VideoSection";
import ReviewsSection    from "@/components/product/ReviewsSection";
import FAQSection        from "@/components/product/FAQSection";
import RelatedSection    from "@/components/product/RelatedSection";
import StickyBuyBox      from "@/components/product/StickyBuyBox";

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetailClient({ product, related }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  // ── Buy box state ───────────────────────────────────────────────────────────
  const [quantity, setQuantity]   = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded]         = useState(false);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // ── Sticky buy box — appears after hero buy panel leaves viewport ───────────
  const buyRef           = useRef<HTMLDivElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Enriched content (falls back gracefully if slug has no entry) ───────────
  const content = getProductContent(product.slug);

  // ── Fallback content for products without specific enrichment ────────────────
  const fallbackContent = {
    problemHeadline: `${product.problemSolved ?? "A common household problem."}`,
    problemIntro: product.longDescription,
    problemPoints: product.tags.map((t) => `Issues related to: ${t}`),
    solutionHeadline: `Meet the ${product.name}`,
    solutionBody: product.longDescription,
    benefits: [
      { iconName: "Check", title: "Quality built-in", description: product.material ?? "Premium materials." },
      { iconName: "Shield", title: "2-year warranty", description: "All HomeNest products carry a 2-year quality guarantee." },
      { iconName: "Zap", title: "Easy to use", description: "Designed so you can get started immediately." },
      { iconName: "Package", title: "Compact design", description: product.dimensions ?? "Fits comfortably in any space." },
    ],
    howItWorks: [
      { step: 1, title: "Unbox", description: "Everything you need is in the box." },
      { step: 2, title: "Set up", description: "No tools required in most cases." },
      { step: 3, title: "Enjoy", description: "Problem solved from day one." },
    ],
    reviews: [],
    faqs: [
      { question: "What is the return policy?", answer: "30-day hassle-free returns. Simply contact support and we'll arrange a free collection." },
      { question: "Is there a warranty?", answer: "Yes — all HomeNest products come with a 2-year quality warranty as standard." },
    ],
    video: {
      thumbnailImage: product.images[0],
      caption: `See the ${product.name} in action.`,
      duration: "Coming soon",
    },
  };

  const c = content ?? fallbackContent;

  return (
    <div className="bg-white">

      {/* 1. Hero — image + buy pane */}
      <ProductHero
        product={product}
        quantity={quantity}
        wishlisted={wishlisted}
        added={added}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        onWishlist={() => setWishlisted((w) => !w)}
        buyRef={buyRef}
      />

      {/* Sentinel — triggers sticky box when hero buy section scrolls out */}
      <div aria-hidden="true" />

      {/* 2. Problem */}
      <ProblemSection content={c} productName={product.name} />

      {/* 3. Solution */}
      <SolutionSection
        content={c}
        productName={product.name}
        productImage={product.images[0]}
      />

      {/* 4. Benefits */}
      <BenefitsSection content={c} />

      {/* 5. Gallery */}
      <GallerySection images={product.images} productName={product.name} />

      {/* 6. Video */}
      <VideoSection video={c.video} productName={product.name} />

      {/* 7. Reviews */}
      {c.reviews.length > 0 && (
        <ReviewsSection
          reviews={c.reviews}
          rating={product.rating}
          reviewCount={product.reviewCount}
        />
      )}

      {/* 8. FAQ */}
      {c.faqs.length > 0 && <FAQSection faqs={c.faqs} />}

      {/* 9. Related solutions */}
      <RelatedSection products={related} category={product.category} />

      {/* 10. Sticky buy box — desktop only, slides in after hero scrolls out */}
      <StickyBuyBox
        product={product}
        visible={showSticky}
        added={added}
        onAddToCart={handleAddToCart}
      />

    </div>
  );
}
