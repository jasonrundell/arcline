import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  paddingY?: "sm" | "md" | "lg";
  hasGradient?: boolean;
  gradientIntensity?: "light" | "medium";
  backgroundImage?: string;
  backgroundOverlay?: boolean;
  overflowHidden?: boolean;
  containerClassName?: string;
}

/**
 * Section Component
 *
 * Unified section wrapper component that provides consistent styling
 * and structure across all page sections. Supports gradient overlays,
 * background images, and customizable padding.
 *
 * @component
 * @example
 * ```tsx
 * <Section id="features" paddingY="md" hasGradient>
 *   <h2>Features</h2>
 * </Section>
 * ```
 */
export const Section = ({
  id,
  children,
  className,
  paddingY = "md",
  hasGradient = false,
  gradientIntensity = "medium",
  backgroundImage,
  backgroundOverlay = false,
  overflowHidden = false,
  containerClassName,
}: SectionProps) => {
  const paddingClasses = {
    sm: "py-12",
    md: "py-16",
    lg: "py-20",
  };

  const gradientClasses = {
    light: "bg-gradient-to-b from-transparent via-card/20 to-transparent",
    medium: "bg-gradient-to-b from-transparent via-card/30 to-transparent",
  };

  const sectionStyle: CSSProperties = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }
    : {};

  return (
    <section
      id={id}
      className={cn(
        paddingClasses[paddingY],
        "px-6 relative",
        overflowHidden && "overflow-hidden",
        className
      )}
      style={sectionStyle}
    >
      {hasGradient && (
        <div
          className={cn(
            "absolute inset-0",
            gradientClasses[gradientIntensity]
          )}
        />
      )}
      {backgroundOverlay && (
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      )}
      <div className={cn("container mx-auto relative", containerClassName)}>
        {children}
      </div>
    </section>
  );
};

