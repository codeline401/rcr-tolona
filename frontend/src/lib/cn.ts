import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes CSS Tailwind en résolvant les conflits.
 * Combine `clsx` (classes conditionnelles) et `tailwind-merge` (déduplication).
 * @param inputs - N'importe quelle valeur acceptée par clsx (string, array, objet, etc.).
 * @returns La chaîne de classes CSS fusionnée.
 * @example cn('px-4 py-2', condition && 'bg-primary', 'px-2') // => 'py-2 bg-primary px-2'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
