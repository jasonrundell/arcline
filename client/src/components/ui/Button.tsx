import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * Button Component
 *
 * A reusable button component.
 *
 * @component
 * @example
 * ```tsx
 * <Button onClick={handleClick}>
 *   TRIGGER
 * </Button>
 * ```
 */
export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <button
      className="px-4 py-2 font-mono bg-gradient-to-b from-primary/40 to-primary/20 border-2 border-primary rounded hover:from-primary/60 hover:to-primary/30 hover:border-primary/80 disabled:hidden disabled:cursor-not-allowed transition-all"
      {...props}
    >
      {children}
    </button>
  );
};
