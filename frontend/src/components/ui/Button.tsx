import { forwardRef } from "react";
import { cn } from "../../lib/cn";

type Variant =
  | "primary"
  | "secondary"
  | "accent"
  | "ghost"
  | "error"
  | "warning"
  | "success";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  outline?: boolean;
}

const sizeMap: Record<Size, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

const variantMap: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  ghost: "btn-ghost",
  error: "btn-error",
  warning: "btn-warning",
  success: "btn-success",
};

/**
 * Bouton réutilisable basé sur DaisyUI.
 * Supporte plusieurs variantes de couleur, tailles, état de chargement et style outline.
 * @param variant - Couleur du bouton (default: "primary").
 * @param size - Taille du bouton (default: "md").
 * @param loading - Si true, désactive le bouton et affiche un spinner DaisyUI.
 * @param outline - Si true, applique le style `btn-outline`.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      outline,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "btn",
          variantMap[variant],
          sizeMap[size],
          outline && "btn-outline",
          loading && "loading",
          className,
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
