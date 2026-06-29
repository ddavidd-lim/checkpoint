import { RIGHT_DRAWER_WIDTH } from '@/constants.ts/drawerWidth';
import { usePlacePois } from '@/hooks/usePlacePois';
import type { Place } from '@/types/places';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from "@mui/material/Box";
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { styled, useTheme } from "@mui/material/styles";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from "@mui/material/Typography";
import { OverviewMap } from '../OverviewMap';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';

const Drawer = styled(MuiDrawer)({
  width: RIGHT_DRAWER_WIDTH,
  flexShrink: 0,
  boxSizing: 'border-box',
  [`& .${drawerClasses.paper}`]: {
    width: RIGHT_DRAWER_WIDTH,
    boxSizing: 'border-box',
  },
});

const TableHeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}));

type Props = {
  handleDrawerClose: () => void;
  open: boolean;
  places: Place[];
}
export default function OverviewMapDrawer({ handleDrawerClose, open, places }: Props) {
  const theme = useTheme();

  const { data: pois = [] } = usePlacePois(places);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="right"
      open={open}
      sx={{
        width: RIGHT_DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: RIGHT_DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          justifyContent: 'start'
        }}
      >
        <Box>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Overview Map
          </Typography>
        </Box>
      </Stack>

      <OverviewMap places={places} />

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ height: 300, overflow: 'auto' }}>
          <Table size='small' stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Address</TableHeaderCell>
                <TableHeaderCell>City, State</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pois.map(poi =>
                <TableRow>
                  <TableCell>{poi.name}</TableCell>
                  <TableCell>{poi.address}</TableCell>
                  <TableCell>{poi.city}, {poi.state}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

      </Paper>
    </Drawer>
  );
}