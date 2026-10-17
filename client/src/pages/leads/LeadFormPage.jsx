import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { leadsApi } from '../../api/leads';
import { companiesApi } from '../../api/companies';
import { usersApi } from '../../api/user';
import { leadFormSchema } from '../../schemas/lead';
import { PageHeader } from '../../components/PageHeader';
import { FormField, inputAria } from '../../components/FormField';
import { ErrorState } from '../../components/ErrorState';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LEAD_STATUSES } from '../../utils/constants';
import { applyFieldErrors, getErrorMessage } from '../../utils/errors';

const emptyValues = {
  name: '',
  email: '',
  phone: '',
  status: 'new',
  assignedTo: '',
  company: '',
  notes: '',
};

export function LeadFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const notify = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(leadFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    let active = true;
    Promise.all([usersApi.options(), companiesApi.options()])
      .then(([userResponse, companyResponse]) => {
        if (!active) return;
        setUsers(userResponse.data.data);
        setCompanies(companyResponse.data.data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err) || 'Unable to load form options');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isEdit) {
      return undefined;
    }
    let active = true;
    setLoading(true);
    leadsApi.get(id)
      .then((response) => {
        if (!active) {
          return;
        }
        const lead = response.data.data;
        reset({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          status: lead.status,
          assignedTo: lead.assignedTo?.id || '',
          company: lead.company?.id || '',
          notes: lead.notes || '',
        });
        if (lead.assignedTo) {
          setUsers((current) => (
            current.some((item) => item.id === lead.assignedTo.id)
              ? current
              : [lead.assignedTo, ...current]
          ));
        }
      })
      .catch((err) => {
        if (active) {
          setError(getErrorMessage(err) || 'Unable to load lead');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id, isEdit, reset]);

  const userOptions = useMemo(() => users, [users]);

  async function onSubmit(values) {
    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      status: values.status,
      company: values.company || null,
      notes: values.notes || '',
    };
    if (isAdmin) payload.assignedTo = values.assignedTo;
    try {
      const response = isEdit ? await leadsApi.update(id, payload) : await leadsApi.create(payload);
      notify(isEdit ? 'Lead updated' : 'Lead created');
      navigate(`/leads/${response.data.data.id}`);
    } catch (err) {
      applyFieldErrors(err, setFieldError);
      notify(getErrorMessage(err, 'Unable to save lead'), 'error');
    }
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit lead' : 'New lead'}
        description="Name, contact details, status, and assignment."
        actions={<Link to={isEdit ? `/leads/${id}` : '/leads'} className="btn-secondary">Cancel</Link>}
      />
      {loading ? <div className="card"><SkeletonLoader rows={5} /></div> : null}
      {!loading && error ? <div className="card"><ErrorState message={error} /></div> : null}
      {!loading && !error ? (
        <form onSubmit={handleSubmit(onSubmit)} className="card grid gap-4 p-5 md:grid-cols-2" noValidate>
          <FormField label="Name" htmlFor="name" error={errors.name?.message}>
            <input {...register('name')} {...inputAria('name', errors.name?.message)} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <input type="email" {...register('email')} {...inputAria('email', errors.email?.message)} />
          </FormField>
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <input {...register('phone')} {...inputAria('phone', errors.phone?.message)} />
          </FormField>
          <FormField label="Status" htmlFor="status" error={errors.status?.message}>
            <select {...register('status')} {...inputAria('status', errors.status?.message)}>
              {LEAD_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </FormField>
          {isAdmin ? (
            <FormField label="Assigned user" htmlFor="assignedTo" error={errors.assignedTo?.message}>
              <select {...register('assignedTo')} {...inputAria('assignedTo', errors.assignedTo?.message)}>
                <option value="">Select a user</option>
                {userOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </FormField>
          ) : (
            <FormField label="Assigned user" htmlFor="assignedTo">
              <input value={users.find((item) => item.id === user?.id)?.name || user?.name || ''} disabled {...inputAria('assignedTo')} />
            </FormField>
          )}
          <FormField label="Company" htmlFor="company" error={errors.company?.message}>
            <select {...register('company')} {...inputAria('company', errors.company?.message)}>
              <option value="">No company</option>
              {companies.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Notes" htmlFor="notes" error={errors.notes?.message}>
              <textarea rows={4} {...register('notes')} {...inputAria('notes', errors.notes?.message)} />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner className="h-4 w-4" /> : null}
              {isSubmitting ? 'Saving…' : 'Save lead'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

export default LeadFormPage;