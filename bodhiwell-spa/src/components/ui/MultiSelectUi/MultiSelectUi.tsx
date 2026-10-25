import React from 'react';
import {
  Box,
  OutlinedInput,
  InputLabel,
  MenuItem,
  Select,
  InputAdornment,
  ListSubheader,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

import { TooltipUi } from '../TooltipUi/TooltipUi';
import { TextFieldUi } from '../TextFieldUi/TextFieldUi';
import { CustomFormControl, CustomChip, MenuProps } from './constant';
import { MultiSelectUiProps } from './types';
import styles from './MultiSelectUi.module.scss';
import { useMultiSelectUi } from './hooks/useMultiSelectUi';

export const MultiSelectUi: React.FC<MultiSelectUiProps> = (props) => {
  const { label, options, value = [], errors, tooltip, disabled, maxLimit, onChange } = props;
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = React.useState(false);
  const {
    searchTerm,
    setSearchTerm,
    filteredOptions,
    handleChange,
    handleDelete,
    handleClose,
  } = useMultiSelectUi({ options, value, onChange, maxLimit });

  const handleInternalChange = (event: any) => {
    handleChange(event);
    if (maxLimit === 1) {
      setIsOpen(false);
    }
  };

  return (
    <Box className={styles.container}>
      <CustomFormControl disabled={disabled} error={!!errors}>
        <InputLabel shrink id={`multi-select-${label}-label`}>{label}</InputLabel>
        
        <Select
          labelId={`multi-select-${label}-label`}
          id={`multi-select-${label}`}
          multiple
          value={value}
          open={isOpen}
          onOpen={() => setIsOpen(true)}
          onClose={() => {
            setIsOpen(false);
            handleClose();
          }}
          onChange={handleInternalChange}
          MenuProps={MenuProps}
          input={<OutlinedInput notched={false} label={label} />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((uid) => {
                const option = options.find((o) => o.uid === uid);
                return (
                  <CustomChip
                    key={uid}
                    label={option ? option.name : uid}
                    onDelete={disabled ? undefined : () => handleDelete(uid)}
                    onMouseDown={(e) => e.stopPropagation()} 
                  />
                );
              })}
            </Box>
          )}
        >
          <ListSubheader sx={{ backgroundColor: '#fff', padding: '8px 12px' }}>
            <TextFieldUi
              placeholder={t('appAdmin.AdvancedFilters.searchPlaceholder', 'Buscar...')}
              fullWidth
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key !== 'Escape' && e.stopPropagation()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#82B194', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
            />
          </ListSubheader>

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <MenuItem
                key={option.uid}
                value={option.uid}
                sx={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '14px',
                  fontWeight: value.includes(option.uid) ? 700 : 400,
                }}
              >
                {option.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <em style={{ fontSize: '0.85rem', color: '#9FA9A5' }}>
                {t('appAdmin.NotificationPage.noResults')}
              </em>
            </MenuItem>
          )}
        </Select>

        {errors && (
          <Box sx={{ mt: 1, fontSize: '11px', color: '#C95C5C', fontWeight: 600 }}>
            {errors}
          </Box>
        )}
      </CustomFormControl>

      {tooltip && (
        <TooltipUi title={tooltip}>
          <Box className={styles['tooltip-icon-wrapper']}>
            <svg viewBox="0 0 512 512">
              <path d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-192a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0-192c-18.2 0-32.7 15.5-31.4 33.7l7.4 104c.9 12.6 11.4 22.3 23.9 22.3 12.6 0 23-9.7 23.9-22.3l7.4-104c1.3-18.2-13.1-33.7-31.4-33.7z" />
            </svg>
          </Box>
        </TooltipUi>
      )}
    </Box>
  );
};