import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { MessagesSection } from "@/components/sections/MessagesSection";
import { IntelSection } from "@/components/sections/IntelSection";
// import ErrorButton from "@/components/ui/error-button";

/**
 * Index Page Component
 *
 * Main landing page of the ARCline application. Composes all major sections
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
      <HeroSection />
      <FeaturesSection />
      <MessagesSection />
      <IntelSection />
      <Footer />
      {/* <ErrorButton /> */}
    </div>
  );
};

export default Index;
