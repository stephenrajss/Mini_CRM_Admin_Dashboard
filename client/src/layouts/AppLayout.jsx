import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const SIDEBAR_KEY = 'minicrm.sidebarOpen';
const DESKTOP_QUERY = '(min-width: 768px)';

function useIsDesktop() {
  const [matches, setMatches] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return matches;
}

function readDesktopOpen() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) !== '0';
  } catch {
    return true;
  }
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const isDesktop = useIsDesktop();

  const [desktopOpen, setDesktopOpen] = useState(readDesktopOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const showSidebarRef = useRef(null);
  const sidebarOpen = isDesktop ? desktopOpen : mobileOpen;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, desktopOpen ? '1' : '0');
    } catch {
      // Preference is optional when storage is unavailable.
    }
  }, [desktopOpen]);

  function hideSidebar() {
    if (isDesktop) {
      setDesktopOpen(false);
    } else {
      setMobileOpen(false);
    }
    window.setTimeout(() => showSidebarRef.current?.focus(), 0);
  }

  function showSidebar() {
    if (isDesktop) {
      setDesktopOpen(true);
    } else {
      setMobileOpen(true);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <div className="md:flex">
        <Sidebar
          user={user}
          mobileOpen={mobileOpen}
          desktopOpen={desktopOpen}
          open={sidebarOpen}
          onNavigate={() => setMobileOpen(false)}
          onHide={hideSidebar}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            user={user}
            showSidebarToggle={!sidebarOpen}
            showSidebarRef={showSidebarRef}
            onShowSidebar={showSidebar}
            onLogout={handleLogout}
          />
          <main id="main" className="flex-1 py-2 md:px-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;