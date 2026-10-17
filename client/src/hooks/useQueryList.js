import { useEffect, useRef, useState } from 'react';
import { getErrorMessage, isCanceled } from '../utils/errors';

export function useQueryList(fetcher, params) {
  const key = JSON.stringify(params);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);

    fetcherRef.current(JSON.parse(key), { signal: controller.signal })
      .then((response) => {
        if (!active) return;
        setRows(response.data.data || []);
        setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
        setError('');
      })
      .catch((err) => {
        if (!active || isCanceled(err)) return;
        setError(getErrorMessage(err) || 'Unable to load records');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [key, version]);

  return {
    rows,
    pagination,
    loading,
    error,
    reload: () => setVersion((current) => current + 1),
  };
}
