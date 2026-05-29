import { cn } from "../../lib/cn";

type AvatarSize = "xs" | "sm" | "md" | "lg";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

/**
 * Extrait les deux initiales d'un nom complet, email ou pseudo.
 * @param name - Chaîne source (séparée par espaces, `@` ou `.`).
 * @returns 1 ou 2 lettres majuscules, ou `"?"` si le nom est vide.
 */
function getInitials(name: string) {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/**
 * Avatar circulaire avec image ou initiales en fallback.
 * Basé sur DaisyUI `avatar` / `avatar placeholder`.
 * @param src - URL de l'image (optionnelle).
 * @param name - Nom utilisé pour l'alt et le calcul des initiales.
 * @param size - Taille de l'avatar (default: "md").
 */
export default function Avatar({
  src,
  name = "",
  size = "md",
  className,
}: AvatarProps) {
  return (
    <div className={cn("avatar", !src && "placeholder")}>
      <div
        className={cn(
          "rounded-full",
          !src && "bg-primary text-primary-content",
          sizeMap[size],
          className,
        )}
      >
        {src ? (
          <img src={src} alt={name} />
        ) : (
          <span>{getInitials(name) || "?"}</span>
        )}
      </div>
    </div>
  );
}
