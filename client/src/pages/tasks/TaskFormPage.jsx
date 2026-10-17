import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { tasksApi } from '../../api/tasks';
import { leadsApi } from '../../api/leads';
import { usersApi } from '../../api/user';
import { taskFormSchema } from '../../schemas/task';
import { PageHeader } from '../../components/PageHeader';
import { FormField, inputAria } from '../../components/FormField';
import { ErrorState } from '../../components/ErrorState';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { fromDateInput, toDateInput } from '../../utils/format';
import { applyFieldErrors, getErrorMessage } from '../../utils/errors';

const emptyValues = { title: '', description: '', lead: '', assignedTo: '', dueDate: '' };

export function TaskFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const notify = useToast();
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(taskFormSchema), defaultValues: emptyValues });

  useEffect(() => {
    let active = true;
    Promise.all([leadsApi.options(), usersApi.options()])
      .then(([leadResponse, userResponse]) => {
        if (!active) {
          return;
        }
        setLeads(leadResponse.data.data);
        setUsers(userResponse.data.data);
      })
      .catch((err) => {
        if (active) {
          setError(getErrorMessage(err) || 'Unable to load form options');
        }
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
    tasksApi.get(id)
      .then((response) => {
        if (!active) {
          return;
        }
        const task = response.data.data;
        reset({
          title: task.title,
          description: task.description || '',
          lead: task.lead?.id || '',
          assignedTo: task.assignedTo?.id || '',
          dueDate: toDateInput(task.dueDate),
        });
        if (task.lead) {
          setLeads((current) => (current.some((item) => item.id === task.lead.id) ? current : [task.lead, ...current]));
        }
        if (task.assignedTo) {
          setUsers((current) => (current.some((item) => item.id === task.assignedTo.id) ? current : [task.assignedTo, ...current]));
        }
      })
      .catch((err) => {
        if (active) {
          setError(getErrorMessage(err) || 'Unable to load task');
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
    const payload = {
      title: values.title,
      description: values.description || '',
      lead: values.lead,
      assignedTo: values.assignedTo,
      dueDate: fromDateInput(values.dueDate),
    };
    try {
      const response = isEdit ? await tasksApi.update(id, payload) : await tasksApi.create(payload);
      notify(isEdit ? 'Task updated' : 'Task created');
      navigate(`/tasks/${response.data.data.id}`);
    } catch (err) {
      applyFieldErrors(err, setFieldError);
      notify(getErrorMessage(err, 'Unable to save task'), 'error');
    }
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit task' : 'New task'}
        description="Only active users and leads that have not been deleted can be selected."
        actions={<Link to={isEdit ? `/tasks/${id}` : '/tasks'} className="btn-secondary">Cancel</Link>}
      />
      {loading ? <div className="card"><SkeletonLoader rows={4} /></div> : null}
      {!loading && error ? <div className="card"><ErrorState message={error} /></div> : null}
      {!loading && !error ? (
        <form onSubmit={handleSubmit(onSubmit)} className="card grid gap-4 p-5 md:grid-cols-2" noValidate>
          <div className="md:col-span-2">
            <FormField label="Title" htmlFor="title" error={errors.title?.message}>
              <input {...register('title')} {...inputAria('title', errors.title?.message)} />
            </FormField>
          </div>
          <FormField label="Lead" htmlFor="lead" error={errors.lead?.message}>
            <select {...register('lead')} {...inputAria('lead', errors.lead?.message)}>
              <option value="">Select a lead</option>
              {leads.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </FormField>
          <FormField label="Assigned user" htmlFor="assignedTo" error={errors.assignedTo?.message}>
            <select {...register('assignedTo')} {...inputAria('assignedTo', errors.assignedTo?.message)}>
              <option value="">Select a user</option>
              {users.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </FormField>
          <FormField label="Due date" htmlFor="dueDate" error={errors.dueDate?.message}>
            <input type="date" {...register('dueDate')} {...inputAria('dueDate', errors.dueDate?.message)} />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Description" htmlFor="description" error={errors.description?.message}>
              <textarea rows={4} {...register('description')} {...inputAria('description', errors.description?.message)} />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner className="h-4 w-4" /> : null}
              {isSubmitting ? 'Saving…' : 'Save task'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

export default TaskFormPage;