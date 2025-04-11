import React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

interface DiscreteSliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (newValue: number) => void;
  marks?: boolean;
  unit?: string;
  width?: string | number;
}

const DiscreteSliderControl: React.FC<DiscreteSliderControlProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  marks = true, // Default to true based on example
  unit = '',
  width = '150px', // Default width
}) => {
  const handleSliderChange = (
    event: Event,
    newValue: number | number[],
  ) => {
    // MUI slider can return array for range, ensure single value
    if (typeof newValue === 'number') {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ width: '100%', padding: '5px 0' }}> 
      <Stack spacing={1} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Typography gutterBottom sx={{ minWidth: '60px', fontSize: '13px' }}>
          {label}:
        </Typography>
        <Slider
          value={value}
          onChange={handleSliderChange}
          aria-labelledby={`${label}-slider`}
          valueLabelDisplay="auto" // Show label on hover/drag
          step={step}
          marks={marks}
          min={min}
          max={max}
          size="small"
          sx={{ width: width, margin: '0 10px'}} // Apply width
        />
        <Typography sx={{ minWidth: '35px', fontSize: '12px', textAlign: 'right'}}>
          {value}{unit}
        </Typography>
      </Stack>
    </Box>
  );
};

export default DiscreteSliderControl; 