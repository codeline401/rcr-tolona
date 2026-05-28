import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  NewspaperIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { useUiStore } from '../../stores/uiStore'
import { cn } from '../../lib/cn'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', Icon: HomeIcon },
  { to: '/membres', label: 'Membres', Icon: UsersIcon },
  { to: '/cotisations', label: 'Cotisations', Icon: CurrencyDollarIcon },
  { to: '/finances', label: 'Finances', Icon: BanknotesIcon },
  { to: '/blog', label: 'Blog', Icon: NewspaperIcon },
  { to: '/voting', label: 'Élections', Icon: CheckBadgeIcon },
  { to: '/activites', label: 'Activités', Icon: CalendarDaysIcon },
]

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-neutral text-neutral-content shadow-lg transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        {!sidebarCollapsed && (
          <span className="text-xl font-bold tracking-wide text-primary-content">
            RCR
          </span>
        )}
        <button
          className="btn btn-ghost btn-sm ml-auto text-neutral-content"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </button>
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
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-primary hover:text-primary-content',
                    isActive && 'bg-primary text-primary-content font-semibold',
                    sidebarCollapsed && 'justify-center px-2',
                  )
                }
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
