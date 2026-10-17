import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Building2, CheckSquare, LayoutDashboard, PanelLeftClose, Users, UserRound } from 'lucide-react';

const ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/leads', label: 'Leads', icon: UserRound },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
];

export function Sidebar(props) {
  const { user, mobileOpen, desktopOpen = true, open = true, onNavigate, onHide } = props;

  const items = ITEMS.filter((item) => !item.adminOnly || user?.role === 'admin');
  const asideRef = useRef(null);

  useEffect(() => {
    const node = asideRef.current;
    if (!node) {
      return;
    }
    if (open) {
      node.removeAttribute('inert');
    } else {
      node.setAttribute('inert', '');
    }
  }, [open]);

  return (
    <aside
      ref={asideRef}
      id="app-sidebar"
      aria-hidden={open ? undefined : true}
      className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out motion-reduce:transition-none md:sticky md:top-0 md:z-auto md:transition-[width] md:duration-300 md:ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${desktopOpen ? 'md:w-64 md:translate-x-0' : 'md:w-0 md:translate-x-0 md:border-r-0'}`}
    >
      <div
        className={`flex h-full w-64 min-w-64 flex-col transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
          desktopOpen ? 'md:translate-x-0' : 'md:-translate-x-full'
        }`}
      >
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white">M</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Mini CRM</p>
          <p className="text-xs text-slate-500">Admin</p>
        </div>
        <button
          type="button"
          className="btn-ghost shrink-0 px-2"
          onClick={onHide}
          aria-label="Hide sidebar"
          aria-controls="app-sidebar"
          aria-expanded="true"
        >
          <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-3" aria-label="Primary">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
        <p className="truncate text-xs text-slate-500">{user?.email}</p>
      </div>
      </div>
    </aside>
  );
}

export default Sidebar;