
import { NavLink } from "react-router-dom";
import {
  BookOpen,
  CalendarRange,
  LayoutDashboard,
  ListChecks,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Manage Words",
    path: "/admin/words",
    icon: BookOpen,
  },
  {
    label: "Daily Schedule",
    path: "/admin/schedule",
    icon: CalendarRange,
  },
  {
    label: "Manage Quiz",
    path: "/admin/quizzes",
    icon: ListChecks,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar({
  isOpen,
  onClose,
}) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-indigo-950 text-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500 p-3">
              <ShieldCheck size={26} />
            </div>

            <div>
              <h2 className="text-xl font-black">OASYS</h2>
              <p className="text-xs font-bold text-indigo-300">
                ADMIN PANEL
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="text-white lg:hidden"
          >
            <X size={23} />
          </button>
        </div>

        <nav
          aria-label="Admin navigation"
          className="flex-1 space-y-2 px-4 py-7"
        >
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-2xl px-5 py-4 font-bold transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-indigo-200 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={21} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-6 py-7">
          <p className="text-sm font-bold text-indigo-300">
            Little steps. Lasting words.
          </p>
        </div>
      </aside>
    </>
  );
}
