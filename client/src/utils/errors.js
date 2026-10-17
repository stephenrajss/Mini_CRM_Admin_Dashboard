export function isCanceled(error) {
  return error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';
}

export function getErrorMessage(error, fallback = 'Something went wrong') {
  if (!error || isCanceled(error)) {
    return '';
  }
  if (!error.response) {
    return 'Unable to reach the server. Check your connection and try again.';
  }
  return error.response.data?.message || fallback;
}

export function applyFieldErrors(error, setError) {
  const errors = error?.response?.data?.errors;
  if (!Array.isArray(errors)) {
    return;
  }
  errors.forEach((item) => {
    if (item.field && item.field !== 'request' && item.field !== 'body') {
      setError(item.field, { message: item.message });
    }
  });
}
