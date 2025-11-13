import HotlineGrid from "@/components/HotlineGrid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
          <p className="text-lg text-arc-gray">
            Choose your hotline below
          </p>
        </div>
        <HotlineGrid />
      </div>
      <Footer />
    </main>
  );
}

