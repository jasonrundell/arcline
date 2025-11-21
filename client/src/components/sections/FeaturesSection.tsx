import { ArrowLeftRight, Package, Egg, Radio as RadioIcon } from "lucide-react";
import { Section } from "@/components/layout/Section";

/**
 * FeaturesSection Component
 *
 * Displays a grid of available hotline services with icons and descriptions.
 * Shows four main services: Extraction Request, Loot Locator, Scrappy's Chicken Line,
 * and Intel Hub. Services that have corresponding sections (Scrappy's Chicken Line
 * and Intel Hub) are clickable links.
 *
 * @component
 * @example
 * ```tsx
 * <FeaturesSection />
 * ```
 */
export const FeaturesSection = () => {
  const serviceItemClasses =
    "flex flex-col items-start gap-4 p-6 rounded-lg transition-all bg-secondary/95";
  const iconClasses = "inline mr-2 w-7 h-7 text-primary";
  const titleClasses = "text-primary mb-2 font-bold text-xl tracking-wide";
  const descriptionClasses = "text-lg";
  const flavourClasses = "text-sm text-muted-foreground italic";
  const linkClasses =
    "text-primary hover:text-primary/80 font-medium text-lg mt-4";

  return (
    <Section paddingY="md" hasGradient>
      <h3 className="text-3xl font-bold text-center mb-12 tracking-widest">
        Available Services
      </h3>
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Extraction Request */}
        <div className={serviceItemClasses}>
          <div className="flex flex-col gap-2">
            <h4 className={titleClasses}>
              <ArrowLeftRight className={iconClasses} />
              Extraction Request
            </h4>
            <p className={descriptionClasses}>
              Call and say <strong>"EXTRACT"</strong>
            </p>
            <p className={flavourClasses}>
              Are you stuck topside? Sweat dripping in fear? Shani's got you.
            </p>
          </div>
        </div>

        {/* Loot Locator */}
        <div className={serviceItemClasses}>
          <div className="flex flex-col gap-2">
            <h4 className={titleClasses}>
              <Package className={iconClasses} />
              Loot Locator
            </h4>
            <p className={descriptionClasses}>
              Call and say <strong>"LOOT"</strong>
            </p>
            <p className={flavourClasses}>
              Tough to access a database topside with that Snitch hovering over
              you.
            </p>
          </div>
        </div>

        {/* Scrappy's Chicken Line - Links to Messages */}

        <div className={serviceItemClasses}>
          <div className="flex flex-col gap-2">
            <h4 className={titleClasses}>
              <Egg className={iconClasses} />
              Scrappy's Chicken Line
            </h4>
            <p className={descriptionClasses}>
              Call and say <strong>"SCRAPPY"</strong>
            </p>
            <p className={descriptionClasses}>
              Verified messages will appear on this site.
            </p>
            <p className={flavourClasses}>
              Always collecting. He never gives up. Who's feeding this guy?
            </p>
            <a href="#messages" className={linkClasses}>
              View messages →
            </a>
          </div>
        </div>

        {/* Intel Hub - Links to Intel */}
        <div className={serviceItemClasses}>
          <div className="flex flex-col gap-2">
            <h4 className={titleClasses}>
              <RadioIcon className={iconClasses} />
              Intel Hub
            </h4>
            <p className={descriptionClasses}>
              Call and say <strong>"SUBMIT"</strong> to submit intel. Once
              verified, your intel will go up on this site for everyone to see.
            </p>
            <p className={descriptionClasses}>
              Call and say <strong>"INTEL"</strong> to listen to the latest
              intel.
            </p>
            <a href="#intel" className={linkClasses}>
              View intel →
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
};
