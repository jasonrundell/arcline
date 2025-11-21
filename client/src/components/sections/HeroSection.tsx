import { Phone } from "lucide-react";
import { APP_NAME, CONTACT } from "@/constants";
import { Section } from "@/components/layout/Section";

/**
 * HeroSection Component
 *
 * Displays the main hero section with the ARC Line phone number and tagline.
 * Features an animated phone icon and call-to-action with the contact number.
 *
 * @component
 * @example
 * ```tsx
 * <HeroSection />
 * ```
 */
export const HeroSection = () => {
  return (
    <Section paddingY="md" containerClassName="text-center z-10">
      <h2 className="text-5xl md:text-7xl font-bold mb-2 bg-foreground from-foreground via-foreground to-primary bg-clip-text text-transparent">
        {APP_NAME}
      </h2>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        Extract. Loot. Intel. Scrappy!
      </p>
      <div className="inline-block px-8 py-6 bg-gradient-to-b from-card to-secondary rounded-2xl border-2 border-border/50">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Phone className="hidden sm:block w-8 h-8 text-primary animate-pulse" />
          <a
            href={`tel:${CONTACT.PHONE}`}
            className="text-2xl sm:text-3xl md:text-5xl font-bold text-primary hover:text-primary/80 transition-all animate-pulse"
          >
            {CONTACT.DISPLAY}
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          Available 24/7 for all your communication needs
        </p>
      </div>
    </Section>
  );
};
