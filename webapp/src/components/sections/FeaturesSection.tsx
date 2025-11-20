import { ArrowLeftRight, Package, Egg, Radio as RadioIcon } from "lucide-react";

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
  const titleClasses = "text-primary mb-2 font-bold text-lg tracking-wide";
  const descriptionClasses = "text-muted-foreground";

  return (
    <section id="features" className="py-20 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent"></div>
      <div className="container mx-auto relative">
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
              <p>Are you stuck topside? Sweat dripping in fear?</p>
              <p className={`${descriptionClasses} mt-4`}>
                Shani's got you. Call and say{" "}
                <strong>"I need an extract!"</strong>
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
              <p>
                Tough to access a database topside with that Snitch hovering
                over you.
              </p>
              <p className={`${descriptionClasses} mt-4`}>
                Call Shani and she'll help you find what you need.{" "}
                <strong>"Where can I find rusted gears?"</strong>
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
              <p>
                Always collecting. He never gives up. Who's feeding this guy?
              </p>
              <p className={descriptionClasses}>
                Call and say <strong>"I need to talk to Scrappy."</strong>
              </p>
              <p className={descriptionClasses}>
                Once your message has been verified, it'll go up on this site
                for Scrappy to check out.
              </p>
              <a href="#messages">
                <p className="text-primary/70 mt-2 italic">→ View messages</p>
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
              <p>Intel is the lifeblood of the Raider network.</p>
              <p className={descriptionClasses}>
                Call and say <strong>"I have intel to share"</strong> if you wan
                to share intel with the Raider network.
              </p>
              <p className={descriptionClasses}>
                Once verified, your intel will go up on this site for everyone
                to see.
              </p>
              <p className={descriptionClasses}>
                Or say <strong>"What's the latest intel?"</strong> to hear the
                latest intel.
              </p>
              <a href="#intel">
                <p className="text-primary/70 mt-2 italic">
                  → View intel reports
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
