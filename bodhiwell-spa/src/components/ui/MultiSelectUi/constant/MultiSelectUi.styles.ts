import { FormControl, styled, Theme, Chip } from '@mui/material';

export const CustomChip = styled(Chip)(({ theme }) => ({
  fontFamily: "'Sora', sans-serif",
  backgroundColor: '#FBF8F5', 
  borderRadius: '8px',
  border: '1px solid rgba(16, 25, 21, 0.08)',
  fontWeight: 600,
  fontSize: '12px',
  color: '#13231D',
  height: '28px',
  maxWidth: 'calc(100% - 12px)',
  '& .MuiChip-label': {
    paddingLeft: '10px',
    paddingRight: '10px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& .MuiChip-deleteIcon': {
    fontSize: '16px',
    color: '#65756E',
    '&:hover': { color: '#C95C5C' },
  },
}));

export const CustomFormControl = styled(FormControl)(({ theme }: { theme: Theme }) => ({
  width: '100%',

  '& .MuiInputLabel-root': {
    position: 'relative',
    transform: 'none',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: 800,
    color: '#6B8277',
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    fontFamily: "'Sora', sans-serif",
    display: 'block',
    '&.Mui-focused': { color: '#6B8277' },
    '&.Mui-error': { color: '#6B8277' },
  },

  '& .MuiOutlinedInput-root': {
    fontFamily: "'Sora', sans-serif",
    borderRadius: '16px',
    backgroundColor: '#FFFFFF',
    minHeight: '50px',
    transition: 'all 0.2s ease',
    fontSize: '15px !important',
    color: '#13231D !important',
    padding: '4px 8px !important',

    '& .MuiSelect-select': {
      padding: '0 !important',
      paddingRight: '15px!important',
    },

    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(16, 25, 21, 0.10)',
      borderWidth: '1px',
      top: 0,
      '& legend': { display: 'none' }, 
    },

    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(16, 25, 21, 0.20)',
    },

    '&.Mui-focused': {
      boxShadow: '0 0 0 4px rgba(130, 177, 148, 0.14)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(130, 177, 148, 0.72)',
      },
    },

    '&.Mui-error': {
      boxShadow: '0 0 0 4px rgba(201, 92, 92, 0.12)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(201, 92, 92, 0.72)',
      },
    },

    '&.Mui-disabled': {
      opacity: 0.48,
      backgroundColor: '#F1F2EF',
    },
  },

  '& .MuiSelect-icon': {
    right: '12px',
    color: '#65756E',
  },

  '& .MuiFormHelperText-root': {
    fontFamily: "'Sora', sans-serif",
    fontSize: '11px',
    marginTop: '8px',
    marginLeft: '0',
    color: '#65756E',
    '&.Mui-error': { color: '#C95C5C', fontWeight: 600 },
  },
}));