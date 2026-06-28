import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from "@mui/material/Box";
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { OverviewMap } from '../OverviewMap';
import { RIGHT_DRAWER_WIDTH } from '@/constants.ts/drawerWidth';
import type { Place } from '@/types/places';

const Drawer = styled(MuiDrawer)({
  width: RIGHT_DRAWER_WIDTH,
  flexShrink: 0,
  boxSizing: 'border-box',
  [`& .${drawerClasses.paper}`]: {
    width: RIGHT_DRAWER_WIDTH,
    boxSizing: 'border-box',
  },
});

type Props = {
  handleDrawerClose: () => void;
  open: boolean;
  places: Place[];
}
export default function OverviewMapDrawer({ handleDrawerClose, open, places }: Props) {

  const theme = useTheme();

  return (
    <Drawer
      variant="persistent"
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
    </Drawer>
  );
}