
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
import Notes from './pages/notes';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const queryClient = new QueryClient();

export default function App() {

  return (
    <ThemeProvider theme={darkTheme}>
      <QueryClientProvider client={queryClient}>
        <Box sx={{ display: 'flex', width: '100%', height: '100dvh', overflow: 'hidden' }}>
          <Notes />
        </Box>
      </QueryClientProvider>
    </ThemeProvider>
  );
}