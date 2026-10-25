export const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 48 * 6,
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
      border: '1px solid rgba(16,25,21,0.08)',
      marginTop: '8px',
    },
  },
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
  getContentAnchorEl: null,
  autoFocus: false,
} as any;

