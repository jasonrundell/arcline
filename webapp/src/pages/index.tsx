import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { ScrappySection } from "@/components/sections/ScrappySection";
import { IntelSection } from "@/components/sections/IntelSection";
import { BioSection } from "@/components/sections/BioSection";
// import ErrorButton from "@/components/ui/error-button";

/**
 * Index Page Component
 *
 * Main landing page of the ARC Line application. Composes all major sections
 * including the header, hero section, features, messages, and intel sections.
 * Uses a gradient background for visual consistency.
 *
 * @component
 * @example
 * ```tsx
 * // Used as the root route in React Router
 * <Route path="/" element={<Index />} />
 * ```
 */
const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      <Header />
      {/* Wrapper for HeroSection and FeaturesSection with rainbow background */}
      <div className="relative overflow-x-hidden overflow-y-hidden">
        {/* Rainbow Lines Background - spans both sections */}
        <div className="absolute -right-20 top-0 w-96 h-full opacity-40 pointer-events-none z-0">
          <div className="sticky top-1/2 -translate-y-1/2 flex gap-3 rotate-12">
            <div className="w-12 h-[200vh] bg-gradient-to-b from-[hsl(190,70%,65%)] to-[hsl(190,70%,55%)] shadow-[0_0_20px_rgba(0,200,255,0.5)]"></div>
            <div className="w-12 h-[200vh] bg-gradient-to-b from-[hsl(140,70%,55%)] to-[hsl(140,70%,45%)] shadow-[0_0_20px_rgba(0,255,100,0.5)]"></div>
            <div className="w-12 h-[200vh] bg-gradient-to-b from-[hsl(50,90%,55%)] to-[hsl(50,90%,45%)] shadow-[0_0_20px_rgba(255,220,0,0.5)]"></div>
            <div className="w-12 h-[200vh] bg-gradient-to-b from-[hsl(10,85%,60%)] to-[hsl(10,85%,50%)] shadow-[0_0_20px_rgba(255,80,80,0.5)]"></div>
          </div>
        </div>
        <div className="relative z-10 overflow-y-hidden">
          <HeroSection />
          <FeaturesSection />
        </div>
      </div>
      <ScrappySection />
      <IntelSection />
      <BioSection />
      <Footer />
      {/* <ErrorButton /> */}
    </div>
  );
};

export default Index;
