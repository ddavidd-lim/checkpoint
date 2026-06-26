// PlacePopover.tsx
import Popover from '@mui/material/Popover'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PlaceIcon from '@mui/icons-material/Place'

interface PlacePopoverProps {
  anchor: HTMLElement | null
  placeId: string
  label: string
  secondaryText: string
  onClose: () => void
}

export function PlacePopover({ anchor, placeId, label, secondaryText, onClose }: PlacePopoverProps) {
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=place_id:${placeId}`
  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`

  return (
    <Popover
      open={!!anchor}
      anchorEl={anchor}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      slotProps={{
        paper: {
          sx: { borderRadius: 2, overflow: 'hidden', width: 420 },
        },
      }}
    >
      {/* Map embed */}
      <Box sx={{ width: '100%', height: 300, bgcolor: 'action.hover' }}>
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0, display: 'block' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={mapSrc}
        />
      </Box>

      {/* Place info */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <PlaceIcon fontSize="small" color="primary" sx={{ mt: 0.25 }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
            <Typography variant="caption" color="text.secondary">{secondaryText}</Typography>
          </Box>
        </Box>
        <IconButton size="small" href={mapsUrl} target="_blank" rel="noopener noreferrer">
          <OpenInNewIcon fontSize="small" />
        </IconButton>
      </Box>
    </Popover>
  )
}