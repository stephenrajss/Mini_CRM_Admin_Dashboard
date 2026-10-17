import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from '../components/Sidebar';

function renderSidebar(role) {
  return render(
    <MemoryRouter>
      <Sidebar user={{ name: 'Alex', email: 'alex@example.com', role }} mobileOpen onNavigate={() => {}} />
    </MemoryRouter>,
  );
}

describe('sidebar permissions', () => {
  it('hides user management from regular users', () => {
    renderSidebar('user');
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Leads' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument();
  });

  it('shows user management to administrators', () => {
    renderSidebar('admin');
    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
  });

  it('asks the layout to hide the sidebar', () => {
    const onHide = vi.fn();
    render(
      <MemoryRouter>
        <Sidebar user={{ name: 'Alex', email: 'alex@example.com', role: 'admin' }} mobileOpen desktopOpen onHide={onHide} onNavigate={() => {}} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Hide sidebar' }));
    expect(onHide).toHaveBeenCalledOnce();
  });
});
