import HotlineGrid from "@/components/HotlineGrid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MAIN_PHONE_NUMBER = process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || "+18722825463";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-arc-cyan glow-cyan">
            ARCline
          </h1>
          <p className="text-xl md:text-2xl text-arc-gray mb-2">
            Multi-Hotline System
          </p>
          <p className="text-lg text-arc-gray mb-4">
            Call <span className="text-arc-orange font-mono font-bold">{MAIN_PHONE_NUMBER}</span> and select an option
          </p>
          <div className="panel terminal-border p-6 max-w-md mx-auto mb-8">
            <p className="text-sm text-arc-gray mb-2">When you call, you'll hear:</p>
            <ul className="text-left text-sm text-arc-sand space-y-1">
              <li>Press <span className="text-arc-orange font-bold">1</span> for Extraction</li>
              <li>Press <span className="text-arc-orange font-bold">2</span> for Loot</li>
              <li>Press <span className="text-arc-orange font-bold">3</span> for Scrappy</li>
              <li>Press <span className="text-arc-orange font-bold">4</span> for News</li>
              <li>Press <span className="text-arc-orange font-bold">5</span> for Event Alarm</li>
            </ul>
          </div>
        </div>
        <HotlineGrid />
      </div>
      <Footer />
    </main>
  );
}

