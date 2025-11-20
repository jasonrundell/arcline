/**
 * Footer Component
 *
 * Displays the site footer with copyright information and security notice.
 *
 * @component
 * @example
 * ```tsx
 * <Footer />
 * ```
 */
export const Footer = () => {
  return (
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
  );
};

