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
    <footer className="py-12 px-6 bg-gradient-to-b from-background to-card">
      <div className="container mx-auto text-center">
        <p className="text-muted-foreground text-sm">
          ARC Line © {new Date().getFullYear()} &mdash; v{packageJson.version}
        </p>
      </div>
    </footer>
  );
};
