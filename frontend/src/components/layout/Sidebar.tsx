import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  NewspaperIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../../lib/cn";
import rcrLogo from "../../assets/rcr-logo.png";

/** Définition des entrées de navigation principales. */
const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", Icon: HomeIcon },
  { to: "/membres", label: "Membres", Icon: UsersIcon },
  { to: "/cotisations", label: "Cotisations", Icon: CurrencyDollarIcon },
  { to: "/finances", label: "Finances", Icon: BanknotesIcon },
  { to: "/blog", label: "Blog", Icon: NewspaperIcon },
  { to: "/voting", label: "Élections", Icon: CheckBadgeIcon },
  { to: "/activites", label: "Activités", Icon: CalendarDaysIcon },
];

/**
 * Barre de navigation latérale fixe.
 * Réduite (icônes seules, w-16) par défaut, s'étend en overlay (w-64) au survol.
 */
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-neutral text-neutral-content shadow-xl transition-all duration-300 overflow-hidden",
        isOpen ? "w-64" : "w-16",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-4">
        <img
          src={rcrLogo}
          alt="RCR"
          className="h-8 w-8 shrink-0 object-contain"
        />
        <span
          className={cn(
            "ml-3 whitespace-nowrap text-lg font-bold tracking-wide text-primary-content transition-all duration-300",
            isOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4 pointer-events-none",
          )}
        >
          RCR - TOLONA
        </span>
      </div>

      <div className="divider my-0" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="menu menu-sm gap-1 px-2">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-primary hover:text-primary-content",
                    isActive && "bg-primary text-primary-content font-semibold",
                    !isOpen && "justify-center px-2",
                  )
                }
                title={!isOpen ? label : undefined}
                aria-label={!isOpen ? label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-300",
                    isOpen
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 w-0 overflow-hidden",
                  )}
                >
                  {label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
