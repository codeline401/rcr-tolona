import { useEffect } from "react";
import { useUiStore } from "../stores/uiStore";

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Fournisseur de thème DaisyUI.
 * Synchronise l'attribut `data-theme` de `<html>` avec le thème stocké dans uiStore.
 * Doit envelopper l'arbre de composants au niveau de `main.tsx`.
 */
export default function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useUiStore((s) => s.theme);

  /**
   * Applique le thème DaisyUI sur `<html data-theme>` chaque fois que le thème change.
   */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <>{children}</>;
}
