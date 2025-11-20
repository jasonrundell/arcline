import {
  Navigation,
  Package,
  Music,
  Radio as RadioIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * FeaturesSection Component
 *
 * Displays a grid of available hotline services with icons and descriptions.
 * Shows four main services: Extraction Request, Loot Locator, Scrappy's Chicken Line,
 * and Intel Hub.
 *
 * @component
 * @example
 * ```tsx
 * <FeaturesSection />
 * ```
 */
export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent"></div>
      <div className="container mx-auto relative">
        <h3 className="text-3xl font-bold text-center mb-12 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
          Available Services
        </h3>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-b from-card to-secondary border-2 border-border shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-2px_8px_rgba(0,0,0,0.3)] transition-shadow hover:shadow-[0_12px_28px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-2px_8px_rgba(0,0,0,0.3)]">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_-2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <Navigation className="w-7 h-7 text-primary drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
                </div>
                <div>
                  <CardTitle className="text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] mb-2">
                    Extraction Request
                  </CardTitle>
                  <CardDescription>
                    "I need an extract, Shani!"
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-b from-card to-secondary border-2 border-border shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-2px_8px_rgba(0,0,0,0.3)] transition-shadow hover:shadow-[0_12px_28px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-2px_8px_rgba(0,0,0,0.3)]">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_-2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <Package className="w-7 h-7 text-primary drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
                </div>
                <div>
                  <CardTitle className="text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] mb-2">
                    Loot Locator
                  </CardTitle>
                  <CardDescription>
                    "Where can I find rusted gears?"
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-b from-card to-secondary border-2 border-border shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-2px_8px_rgba(0,0,0,0.3)] transition-shadow hover:shadow-[0_12px_28px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-2px_8px_rgba(0,0,0,0.3)]">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_-2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <Music className="w-7 h-7 text-primary drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
                </div>
                <div>
                  <CardTitle className="text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] mb-2">
                    Scrappy's Chicken Line
                  </CardTitle>
                  <CardDescription>
                    "I need to talk to Scrappy, bruh."
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-b from-card to-secondary border-2 border-border shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-2px_8px_rgba(0,0,0,0.3)] transition-shadow hover:shadow-[0_12px_28px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-2px_8px_rgba(0,0,0,0.3)]">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_-2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <RadioIcon className="w-7 h-7 text-primary drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
                </div>
                <div>
                  <CardTitle className="text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] mb-2">
                    Intel Hub
                  </CardTitle>
                  <CardDescription>
                    "I have intel to share/What's the latest intel?"
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};

