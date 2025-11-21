import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Card Component
 *
 * A container component for displaying content in a card layout. Provides
 * consistent styling with rounded corners, border, and shadow.
 *
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard HTML div attributes
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to the div element
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Card content goes here</p>
 *   </CardContent>
 * </Card>
 * ```
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

/**
 * CardHeader Component
 *
 * Header section of a card, typically containing the title and description.
 * Provides consistent spacing and layout for card headers.
 *
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard HTML div attributes
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to the div element
 *
 * @example
 * ```tsx
 * <CardHeader>
 *   <CardTitle>My Card</CardTitle>
 *   <CardDescription>This is a description</CardDescription>
 * </CardHeader>
 * ```
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * CardTitle Component
 *
 * Title element for a card. Renders as an h3 heading with consistent
 * typography styling.
 *
 * @component
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props - Standard HTML heading attributes
 * @param {React.Ref<HTMLHeadingElement>} ref - Forwarded ref to the heading element
 *
 * @example
 * ```tsx
 * <CardTitle>Card Title</CardTitle>
 * ```
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * CardDescription Component
 *
 * Description text for a card. Renders as a paragraph with muted text styling.
 *
 * @component
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props - Standard HTML paragraph attributes
 * @param {React.Ref<HTMLParagraphElement>} ref - Forwarded ref to the paragraph element
 *
 * @example
 * ```tsx
 * <CardDescription>This is a card description</CardDescription>
 * ```
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * CardContent Component
 *
 * Main content area of a card. Provides consistent padding and spacing
 * for card body content.
 *
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard HTML div attributes
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to the div element
 *
 * @example
 * ```tsx
 * <CardContent>
 *   <p>Main card content goes here</p>
 * </CardContent>
 * ```
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * CardFooter Component
 *
 * Footer section of a card, typically containing action buttons or additional
 * information. Provides consistent spacing and flex layout for footer content.
 *
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard HTML div attributes
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to the div element
 *
 * @example
 * ```tsx
 * <CardFooter>
 *   <button>Action</button>
 * </CardFooter>
 * ```
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
