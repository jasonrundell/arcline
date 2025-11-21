import packageJson from "../../../package.json";

/**
 * Footer Component
 *
 * Displays the site footer with copyright information, version, and security notice.
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
        <p className="text-muted-foreground text-sm">
          ARC Line © {new Date().getFullYear()} &mdash; v{packageJson.version}
        </p>
      </div>
    </footer>
  );
};
