import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { MessagesSection } from "@/components/sections/MessagesSection";
import { IntelSection } from "@/components/sections/IntelSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <MessagesSection />
      <IntelSection />
      <Footer />
    </div>
  );
};

export default Index;
