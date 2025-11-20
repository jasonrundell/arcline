import { useState } from "react";
import {
  Phone,
  Navigation,
  Package,
  Music,
  Radio as RadioIcon,
  Menu,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import scrappyBg from "@/assets/scrappy-messages-bg.webp";
import scrappyImage from "@/assets/scrappy.webp";
import { useMessages } from "@/hooks/use-messages";
import { useIntel } from "@/hooks/use-intel";
import { format, formatDistanceToNow } from "date-fns";

const Index = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useMessages();
  const {
    data: intel,
    isLoading: intelLoading,
    error: intelError,
  } = useIntel();

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      {/* Header */}
      <header className="bg-gradient-to-b from-header to-header/90 text-header-foreground py-4 px-6 border-b-4 border-header-foreground/20 sticky top-0 z-50 shadow-[0_8px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.3)]">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            ARCline
          </h1>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <a
              href="#features"
              className="hover:text-primary transition-all px-3 py-2 rounded hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
            >
              Features
            </a>
            <a
              href="#messages"
              className="hover:text-primary transition-all px-3 py-2 rounded hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
            >
              Messages
            </a>
            <a
              href="#intel"
              className="hover:text-primary transition-all px-3 py-2 rounded hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
            >
              Intel
            </a>
          </nav>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded hover:bg-header-foreground/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-header-foreground/20 pt-4">
            <div className="container mx-auto flex flex-col gap-2">
              <a
                href="#features"
                onClick={handleNavClick}
                className="hover:text-primary transition-all px-3 py-2 rounded hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] text-center"
              >
                Features
              </a>
              <a
                href="#messages"
                onClick={handleNavClick}
                className="hover:text-primary transition-all px-3 py-2 rounded hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] text-center"
              >
                Messages
              </a>
              <a
                href="#intel"
                onClick={handleNavClick}
                className="hover:text-primary transition-all px-3 py-2 rounded hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] text-center"
              >
                Intel
              </a>
            </div>
          </nav>
        )}
      </header>

      {/* Hero Section */}
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

      {/* Features Section */}
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

      {/* Scrappy Messages Section */}
      <section
        id="messages"
        className="py-20 px-6 relative overflow-hidden"
        style={{
          backgroundImage: `url(${scrappyBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm"></div>

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
              Messages for Scrappy
            </h3>
            <p className="text-muted-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
              Scrappy prefers it when you leave a message for him.
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            {messagesLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                  Loading messages...
                </p>
              </div>
            )}
            {messagesError && (
              <div className="text-center py-8">
                <p className="text-destructive drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                  Error loading messages. Please try again later.
                </p>
              </div>
            )}
            {messages && messages.length > 0
              ? messages.map((message, index) => {
                  const messageDate = message.created_at
                    ? new Date(message.created_at)
                    : new Date();
                  let formattedDate: string;
                  if (isNaN(messageDate.getTime())) {
                    // Use current date as fallback
                    formattedDate = format(new Date(), "MM/dd/yyyy HH:mm");
                  } else {
                    formattedDate = format(messageDate, "MM/dd/yyyy HH:mm");
                  }
                  const messageNumber = String(index + 1).padStart(3, "0");

                  return (
                    <Card
                      key={message.id}
                      className="bg-gradient-to-br from-secondary via-secondary to-secondary/90 border-2 border-primary/30 shadow-[0_6px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-2px_6px_rgba(0,0,0,0.4)] relative before:absolute before:inset-0 before:rounded-lg before:bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)] group overflow-hidden"
                    >
                      <img
                        src={scrappyImage}
                        alt="Scrappy"
                        className="absolute top-8 -right-8 w-1/2 h-1/2 object-contain opacity-0 group-hover:opacity-100 group-hover:animate-vibrate transition-opacity duration-300 pointer-events-none z-10"
                      />
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-mono text-primary drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]">
                            ► MESSAGE {messageNumber || ""}
                          </CardTitle>
                          <span className="text-xs text-muted-foreground font-mono bg-background/40 px-2 py-1 rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                            {formattedDate || ""}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground font-mono text-sm leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                          {message.content || ""}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })
              : !messagesLoading &&
                !messagesError && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                      More messages will appear as they're received...
                    </p>
                  </div>
                )}
          </div>
        </div>
      </section>

      {/* Intel Submissions Section */}
      <section id="intel" className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent"></div>
        <div className="container mx-auto relative">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
              Intel Submissions
            </h3>
            <p className="text-muted-foreground drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
              Anonymous intelligence reports from the field
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            {intelLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                  Loading intel reports...
                </p>
              </div>
            )}
            {intelError && (
              <div className="text-center py-8">
                <p className="text-destructive drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                  Error loading intel reports. Please try again later.
                </p>
              </div>
            )}
            {intel && intel.length > 0
              ? intel.map((report) => {
                  const reportDate = new Date(report.created_at);
                  const formattedDate = formatDistanceToNow(reportDate, {
                    addSuffix: true,
                  });
                  const reportId = report.id.slice(0, 8).toUpperCase();

                  return (
                    <Card
                      key={report.id}
                      className="bg-gradient-to-br from-card to-secondary border-2 border-border shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-2px_8px_rgba(0,0,0,0.3)]"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                            Report #{reportId}
                          </CardTitle>
                          <span className="text-xs text-muted-foreground bg-background/30 px-2 py-1 rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                            {formattedDate}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                          {report.content}
                        </p>
                        <div className="flex gap-2">
                          {report.priority && (
                            <span className="px-3 py-1 bg-gradient-to-b from-primary/20 to-primary/10 text-primary text-xs rounded-full border border-primary/40 shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]">
                              {report.priority}
                            </span>
                          )}
                          <span className="px-3 py-1 bg-gradient-to-b from-muted to-muted/80 text-muted-foreground text-xs rounded-full border border-border shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]">
                            Verified
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              : !intelLoading &&
                !intelError && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                      Submit intel by calling the hotline...
                    </p>
                  </div>
                )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t-4 border-border/50 bg-gradient-to-b from-background to-card shadow-[inset_0_4px_8px_rgba(0,0,0,0.3)]">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
            ARCline © 2024 - Secure Communications System
          </p>
          <p className="text-xs text-muted-foreground mt-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            All transmissions are monitored and encrypted
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
