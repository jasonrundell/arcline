import { Phone } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Rainbow Lines Background */}
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-96 h-[150%] opacity-40 pointer-events-none">
        <div className="absolute inset-0 flex gap-3 rotate-12">
          <div className="w-12 h-full bg-gradient-to-b from-[hsl(190,70%,65%)] to-[hsl(190,70%,55%)] rounded-full shadow-[0_0_20px_rgba(0,200,255,0.5)]"></div>
          <div className="w-12 h-full bg-gradient-to-b from-[hsl(140,70%,55%)] to-[hsl(140,70%,45%)] rounded-full shadow-[0_0_20px_rgba(0,255,100,0.5)]"></div>
          <div className="w-12 h-full bg-gradient-to-b from-[hsl(50,90%,55%)] to-[hsl(50,90%,45%)] rounded-full shadow-[0_0_20px_rgba(255,220,0,0.5)]"></div>
          <div className="w-12 h-full bg-gradient-to-b from-[hsl(10,85%,60%)] to-[hsl(10,85%,50%)] rounded-full shadow-[0_0_20px_rgba(255,80,80,0.5)]"></div>
        </div>
      </div>

      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-b from-foreground via-foreground to-primary bg-clip-text text-transparent drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          ARCline
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
          Extract. Loot. Intel. Scrappy!
        </p>
        <div className="inline-block px-8 py-6 bg-gradient-to-b from-card to-secondary rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-4px_12px_rgba(0,0,0,0.4)] border-2 border-border/50">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Phone className="w-8 h-8 text-primary animate-pulse drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
            <a
              href="tel:+18722825463"
              className="text-3xl md:text-5xl font-bold text-primary hover:text-primary/80 transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-pulse"
            >
              +1 (872) 282-LINE
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            Available 24/7 for all your communication needs
          </p>
        </div>
      </div>
    </section>
  );
};

