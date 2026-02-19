import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/Button";
import {
  IoCloseOutline,
  IoLogOutOutline,
  IoMenuOutline,
  IoNotifications,
} from "react-icons/io5";
import { useNotifications } from "../hooks/useNotifications";

const linkBase =
  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-(--color-bg)";

const linkActive = "bg-(--color-bg) text-(--color-dark)";

export const Home = () => {
  const { logout, role, fullName, email } = useAuth();
  const isManager = role === "Manager";
  const isHr = role === "HR";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const notifications = useNotifications();
  const unreadCount =
    notifications.data?.length ?? 0;

  const navLinks = (
    <nav className="rounded-2xl border border-slate-200 bg-(--color-light) text-(--color-dark) p-2 shadow-sm">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : ""}`
        }
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/travels"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : ""}`
        }
      >
        Travels
      </NavLink>
      <NavLink
        to="/notifications"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : ""}`
        }
      >
        Notifications
      </NavLink>
      <NavLink
        to="/org-chart"
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : ""}`
        }
      >
        Organization chart
      </NavLink>
      <NavLink
        to="/games"
        end
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : ""}`
        }
      >
        Games
      </NavLink>
      {isManager ? (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Manager
          </p>
          <NavLink
            to="/manager/team-members"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Team members
          </NavLink>
          <NavLink
            to="/games/admin"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Games admin
          </NavLink>
        </div>
      ) : null}
      {isHr ? (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
            HR
          </p>
          <NavLink
            to="/hr/reviews"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Expense reviews
          </NavLink>
          <NavLink
            to="/hr/expense-config"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Expense configuration
          </NavLink>
          <NavLink
            to="/games/admin"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Games admin
          </NavLink>
        </div>
      ) : null}
    </nav>
  );

  return (
    <div className="h-screen overflow-hidden bg-(--color-bg) text-(--color-dark) flex flex-col">
      <header className="border-b sticky top-0 z-50 w-screen border-slate-200 bg-(--color-primary) text-(--color-text)">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 p-2 text-(--color-text) md:hidden"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open navigation"
            >
              <IoMenuOutline size={22} />
            </button>
            <div>
              <p className="text-sm font-semibold text-(--color-text)">HRMS</p>
              <h1 className="text-lg font-semibold">Travel & Expense</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
      
            <Link to="/notifications" className="relative">
              <IoNotifications className="h-8 w-8 text-(--colore-text) cursor-pointer" />

              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                {unreadCount}
              </span>
            </Link>

            <Link
              className="inline-flex items-center justify-center rounded-md border border-white/40 bg-white/10 px-3 py-2 text-xs font-semibold text-(--color-text) hover:bg-white/20 sm:px-4 sm:text-sm"
              to="/profile"
            >
              Profile
            </Link>
            <Button variant="dark" className="border " onClick={logout}>
              Sign out
              <IoLogOutOutline color="red" size={20} />
            </Button>
          </div>
        </div>
      </header>

      {isMenuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-(--color-bg) p-6 shadow-xl transition-transform duration-200 md:hidden flex flex-col ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Navigation</p>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 p-1"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation"
          >
            <IoCloseOutline size={20} />
          </button>
        </div>
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">{navLinks}</div>
      </aside>

      <div className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-64 shrink-0 flex-col gap-6 md:flex">
          <div className="h-full overflow-y-auto pr-1">{navLinks}</div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};