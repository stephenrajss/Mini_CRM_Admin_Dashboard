import { createContext, useCallback, useContext, useState } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const notify = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const close = useCallback((_event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToast((current) => ({ ...current, open: false }));
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={close} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
