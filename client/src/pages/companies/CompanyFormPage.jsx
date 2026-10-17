import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { companiesApi } from '../../api/companies';
import { companyFormSchema } from '../../schemas/company';
import { PageHeader } from '../../components/PageHeader';
import { FormField, inputAria } from '../../components/FormField';
import { ErrorState } from '../../components/ErrorState';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { applyFieldErrors, getErrorMessage } from '../../utils/errors';

const emptyValues = {
  name: '',
  industry: '',
  location: '',
  website: '',
  phone: '',
  description: '',
};

export function CompanyFormPage() {
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
  } = useForm({ resolver: zodResolver(companyFormSchema), defaultValues: emptyValues });

  useEffect(() => {
    if (!isEdit) {
      return undefined;
    }
    let active = true;
    companiesApi.get(id)
      .then((response) => {
        if (!active) {
          return;
        }
        const company = response.data.data;
        reset({
          name: company.name,
          industry: company.industry,
          location: company.location,
          website: company.website || '',
          phone: company.phone || '',
          description: company.description || '',
        });
      })
      .catch((err) => {
        if (active) {
          setError(getErrorMessage(err) || 'Unable to load company');
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

  async function onSubmit(values) {
    try {
      const response = isEdit ? await companiesApi.update(id, values) : await companiesApi.create(values);
      notify(isEdit ? 'Company updated' : 'Company created');
      navigate(`/companies/${response.data.data.id}`);
    } catch (err) {
      applyFieldErrors(err, setFieldError);
      notify(getErrorMessage(err, 'Unable to save company'), 'error');
    }
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit company' : 'New company'}
        description="Names are matched without regard to case or extra spaces."
        actions={<Link to={isEdit ? `/companies/${id}` : '/companies'} className="btn-secondary">Cancel</Link>}
      />
      {loading ? <div className="card"><SkeletonLoader rows={4} /></div> : null}
      {!loading && error ? <div className="card"><ErrorState message={error} /></div> : null}
      {!loading && !error ? (
        <form onSubmit={handleSubmit(onSubmit)} className="card grid gap-4 p-5 md:grid-cols-2" noValidate>
          <FormField label="Company name" htmlFor="name" error={errors.name?.message}>
            <input {...register('name')} {...inputAria('name', errors.name?.message)} />
          </FormField>
          <FormField label="Industry" htmlFor="industry" error={errors.industry?.message}>
            <input {...register('industry')} {...inputAria('industry', errors.industry?.message)} />
          </FormField>
          <FormField label="Location" htmlFor="location" error={errors.location?.message}>
            <input {...register('location')} {...inputAria('location', errors.location?.message)} />
          </FormField>
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <input {...register('phone')} {...inputAria('phone', errors.phone?.message)} />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Website" htmlFor="website" error={errors.website?.message} hint="Optional. Include http:// or https://">
              <input {...register('website')} {...inputAria('website', errors.website?.message)} />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField label="Description" htmlFor="description" error={errors.description?.message}>
              <textarea rows={4} {...register('description')} {...inputAria('description', errors.description?.message)} />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner className="h-4 w-4" /> : null}
              {isSubmitting ? 'Saving…' : 'Save company'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

export default CompanyFormPage;