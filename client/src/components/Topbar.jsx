import { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { LogOut, PanelLeftOpen } from 'lucide-react';

import { usePageTitle } from '../context/PageMetaContext';
import { StatusBadge } from './StatusBadge';

export function Topbar(props) {
  const { user, showSidebarToggle, showSidebarRef, onShowSidebar, onLogout } = props;
  const title = usePageTitle();
  const [anchor, setAnchor] = useState(null);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {showSidebarToggle ? (
          <button
            type="button"
            ref={showSidebarRef}
            className="btn-ghost px-2"
            onClick={onShowSidebar}
            aria-label="Show sidebar"
            aria-controls="app-sidebar"
            aria-expanded="false"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        ) : null}
        <h2 className="truncate text-base font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge value={user?.role} />
        <button
          type="button"
          className="btn-secondary max-w-[180px]"
          aria-haspopup="menu"
          aria-expanded={Boolean(anchor)}
          onClick={(event) => setAnchor(event.currentTarget)}
        >
          <span className="truncate">{user?.name}</span>
        </button>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          <MenuItem
            onClick={() => {
              setAnchor(null);
              onLogout();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Log out
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}

export default Topbar;