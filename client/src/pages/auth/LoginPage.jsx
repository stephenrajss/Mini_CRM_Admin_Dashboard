import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import { loginSchema } from '../../schemas/auth.schema';
import { useAuth } from '../../context/AuthContext';
import { FormField, inputAria } from '../../components/FormField';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getErrorMessage } from '../../utils/errors';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values) {
    setFormError('');
    try {
      await login(values);
      const next = location.state?.from?.pathname || '/';
      navigate(next, { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to sign in'));
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-slate-900 px-12 py-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 font-semibold">M</span>
          <span className="text-lg font-semibold">Mini CRM</span>
        </div>
        <div>
          <h1 className="max-w-md text-4xl font-semibold tracking-tight">A calm workspace for leads, companies, and tasks.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Track pipeline status, assign work, and keep follow-ups visible without leaving the admin dashboard.
          </p>
        </div>
        <p className="text-sm text-slate-400">Secure session via an HttpOnly cookie.</p>
      </section>
      <section className="flex items-center justify-center px-4 py-12">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md" noValidate>
          <p className="text-sm font-medium text-indigo-600 lg:hidden">Mini CRM</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Use the administrator account created by the seed script.</p>
          {formError ? (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="mt-6 space-y-4">
            <FormField label="Email" htmlFor="email" error={errors.email?.message}>
              <input
                type="email"
                autoComplete="email"
                {...register('email')}
                {...inputAria('email', errors.email?.message)}
              />
            </FormField>
            <FormField label="Password" htmlFor="password" error={errors.password?.message}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  {...inputAria('password', errors.password?.message)}
                  className="input pr-11"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>
          </div>
          <button type="submit" className="btn-primary mt-6 w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoadingSpinner className="h-4 w-4" /> : null}
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </div>
  );
}