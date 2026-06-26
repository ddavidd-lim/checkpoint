import Box from "@mui/material/Box"

import PlaceIcon from '@mui/icons-material/Place'

interface PlaceChipProps {
  label: string
}

export function PlaceChip({ label }: PlaceChipProps) {
  return (
    <Box
      component="span"
      contentEditable={false}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.25,
        borderRadius: 99,
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        fontSize: '0.8rem',
        fontWeight: 500,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <PlaceIcon sx={{ fontSize: '0.9rem' }} />
      {label}
    </Box>
  )
}
