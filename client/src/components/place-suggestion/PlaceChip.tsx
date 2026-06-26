import Box from "@mui/material/Box"

import PlaceIcon from '@mui/icons-material/Place'
import { useRef } from "react"

interface PlaceChipProps {
  label: string;
  onClick: (anchor: HTMLElement) => void;

}

export function PlaceChip({ label, onClick }: PlaceChipProps) {
  const ref = useRef<HTMLSpanElement>(null)

  return (
    <Box
      ref={ref}
      component="span"
      contentEditable={false}
      onClick={() => ref.current && onClick(ref.current)}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.25,
        borderRadius: 1,
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
