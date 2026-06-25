
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
import { closeSnackbar, SnackbarProvider } from 'notistack';
import { useDarkMode } from './context/theme-toggle/dark-mode-context';
import Notes from './pages/notes';
import { useMemo } from 'react';



const queryClient = new QueryClient();

export default function App() {
  const { isDarkMode } = useDarkMode();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          background: {
            default: isDarkMode ? '#191919' : '#fafafa',
            paper: isDarkMode ? '#202020' : '#ffffff',
          },

        },
      }),
    [isDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider autoHideDuration={1500} maxSnack={4} action={(id) => (
        <IconButton onClick={() => closeSnackbar(id)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      />
      <QueryClientProvider client={queryClient}>
        <Box sx={{ display: 'flex', width: '100%', height: '100dvh', overflow: 'hidden' }}>
          <Notes />
        </Box>
      </QueryClientProvider>
    </ThemeProvider>
  );
}