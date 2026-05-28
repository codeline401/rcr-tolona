import {
  BellIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../stores/authStore'
import { useUiStore } from '../../stores/uiStore'
import Avatar from '../ui/Avatar'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useUiStore()

  return (
    <header className="navbar sticky top-0 z-30 border-b border-base-300 bg-base-100 px-4 shadow-sm">
      <div className="flex-1">
        <span className="text-sm text-base-content/60">
          Bienvenue, <span className="font-semibold text-base-content">{user?.email}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          className="btn btn-ghost btn-sm btn-circle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'rcr' ? (
            <MoonIcon className="h-5 w-5" />
          ) : (
            <SunIcon className="h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <button className="btn btn-ghost btn-sm btn-circle" aria-label="Notifications">
          <BellIcon className="h-5 w-5" />
        </button>

        {/* User menu */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
            <Avatar name={user?.email ?? 'U'} size="sm" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu menu-sm z-50 mt-2 w-48 rounded-box bg-base-100 p-2 shadow"
          >
            <li>
              <button
                className="flex items-center gap-2 text-error"
                onClick={logout}
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
