import { useState, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { APP_NAME } from "@/constants";

/**
 * Header Component
 *
 * Displays the main site header with navigation links. Includes a responsive
 * mobile menu that toggles on smaller screens. The header is sticky and remains
 * visible when scrolling.
 *
 * @component
 * @example
 * ```tsx
 * <Header />
 * ```
 */
export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleScrollToTop = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  const linkClasses =
    "px-4 py-2 rounded-full border-2 border-transparent hover:border-secondary font-medium";
  const mobileLinkClasses = "px-4 py-2 font-medium text-center";

  return (
    <header className="bg-gradient-to-b from-header to-header text-header-foreground py-4 px-6 border-b-4 border-header-foreground/20 sticky top-0 z-50 shadow-[0_8px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] relative before:absolute before:inset-0 before:opacity-30 before:pointer-events-none before:bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.15)_1px,transparent_0)] before:bg-[length:20px_20px] after:absolute after:inset-0 after:opacity-20 after:pointer-events-none after:bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.1)_1px,transparent_0)] after:bg-[length:15px_15px]">
      <div className="container mx-auto flex items-center justify-between relative z-10">
        <a href="#" onClick={handleScrollToTop}>
          <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
        </a>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          <a href="#" onClick={handleScrollToTop} className={linkClasses}>
            Home
          </a>
          <a href="#messages" className={linkClasses}>
            Messages
          </a>
          <a href="#intel" className={linkClasses}>
            Intel
          </a>
          <a href="#project" className={linkClasses}>
            Project
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
        <nav className="md:hidden mt-4 pb-4 border-t border-header-foreground/20 pt-4 relative z-10">
          <div className="container mx-auto flex flex-col gap-2">
            <a
              href="#"
              onClick={e => { handleScrollToTop(e); handleNavClick(); }}
              className={mobileLinkClasses}
            >
              Home
            </a>
            <a
              href="#messages"
              onClick={handleNavClick}
              className={mobileLinkClasses}
            >
              Messages
            </a>
            <a
              href="#intel"
              onClick={handleNavClick}
              className={mobileLinkClasses}
            >
              Intel
            </a>
            <a
              href="#project"
              onClick={handleNavClick}
              className={mobileLinkClasses}
            >
              Project
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};
