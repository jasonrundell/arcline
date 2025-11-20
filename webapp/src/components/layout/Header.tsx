import { useState, useCallback } from "react";
import { Menu, X } from "lucide-react";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
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
  );
};
