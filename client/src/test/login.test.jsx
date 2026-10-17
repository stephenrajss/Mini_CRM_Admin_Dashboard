import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '../pages/auth/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { authApi } from '../api/auth';

vi.mock('../api/auth', () => ({
  authApi: {
    me: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('login page', () => {
  beforeEach(() => {
    localStorage.clear();
    authApi.me.mockRejectedValue({ response: { status: 401, data: { message: 'Authentication required' } } });
    authApi.login.mockReset();
  });

  it('shows a validation error for an invalid email', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('toggles password visibility', async () => {
    renderLogin();
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
  });
});
