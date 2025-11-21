import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Props for the NavLink component.
 *
 * @interface NavLinkCompatProps
 * @extends {Omit<NavLinkProps, "className">}
 * @property {string} [className] - Base CSS classes to apply to the link
 * @property {string} [activeClassName] - CSS classes to apply when the link is active
 * @property {string} [pendingClassName] - CSS classes to apply when the link is pending navigation
 */
interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

/**
 * NavLink Component
 *
 * A styled navigation link component that wraps React Router's NavLink with
 * enhanced className handling. Automatically applies active and pending states
 * based on the current route.
 *
 * @component
 * @param {NavLinkCompatProps} props - Component props
 * @param {React.Ref<HTMLAnchorElement>} ref - Forwarded ref to the anchor element
 *
 * @example
 * ```tsx
 * // Basic usage
 * <NavLink to="/about">About</NavLink>
 *
 * // With custom styling
 * <NavLink
 *   to="/contact"
 *   className="text-blue-500"
 *   activeClassName="font-bold text-blue-700"
 *   pendingClassName="opacity-50"
 * >
 *   Contact
 * </NavLink>
 * ```
 */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(
            className,
            isActive && activeClassName,
            isPending && pendingClassName
          )
        }
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };
