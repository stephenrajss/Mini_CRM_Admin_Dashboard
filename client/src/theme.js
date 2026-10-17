import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#4f46e5' },
    error: { main: '#e11d48' },
    success: { main: '#059669' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});
