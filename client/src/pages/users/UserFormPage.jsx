import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { usersApi } from '../../api/user';
import { createUserSchema, updateUserSchema } from '../../schemas/user';
import { PageHeader } from '../../components/PageHeader';
import { FormField, inputAria } from '../../components/FormField';
import { ErrorState } from '../../components/ErrorState';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { USER_ROLES } from '../../utils/constants';
import { applyFieldErrors, getErrorMessage } from '../../utils/errors';

export function UserFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const notify = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: { name: '', email: '', password: '', role: 'user' },
  });

  useEffect(() => {
    if (!isEdit) {
      return undefined;
    }
    let active = true;
    usersApi.get(id)
      .then((response) => {
        if (!active) return;
        const account = response.data.data;
        reset({ name: account.name, email: account.email, password: '', role: account.role });
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err) || 'Unable to load user');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isEdit, reset]);

  async function onSubmit(values) {
    const payload = {
      name: values.name,
      email: values.email,
      role: values.role,
    };
    if (!isEdit || values.password) payload.password = values.password;
    try {
      await (isEdit ? usersApi.update(id, payload) : usersApi.create(payload));
      notify(isEdit ? 'User updated' : 'User created');
      navigate('/users');
    } catch (err) {
      applyFieldErrors(err, setFieldError);
      notify(getErrorMessage(err, 'Unable to save user'), 'error');
    }
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit user' : 'New user'}
        description="Passwords are hashed and never returned by the API."
        actions={<Link to="/users" className="btn-secondary">Cancel</Link>}
      />
      {loading ? <div className="card"><SkeletonLoader rows={4} /></div> : null}
      {!loading && error ? <div className="card"><ErrorState message={error} /></div> : null}
      {!loading && !error ? (
        <form onSubmit={handleSubmit(onSubmit)} className="card grid max-w-2xl gap-4 p-5" noValidate>
          <FormField label="Name" htmlFor="name" error={errors.name?.message}>
            <input {...register('name')} {...inputAria('name', errors.name?.message)} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <input type="email" {...register('email')} {...inputAria('email', errors.email?.message)} />
          </FormField>
          <FormField
            label={isEdit ? 'New password' : 'Password'}
            htmlFor="password"
            error={errors.password?.message}
            hint={isEdit ? 'Leave blank to keep the current password.' : 'At least 8 characters, with a letter and a number.'}
          >
            <input type="password" autoComplete="new-password" {...register('password')} {...inputAria('password', errors.password?.message)} />
          </FormField>
          <FormField label="Role" htmlFor="role" error={errors.role?.message}>
            <select {...register('role')} {...inputAria('role', errors.role?.message)}>
              {USER_ROLES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </FormField>
          <div>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner className="h-4 w-4" /> : null}
              {isSubmitting ? 'Saving…' : 'Save user'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

export default UserFormPage;