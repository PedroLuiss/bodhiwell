import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import SwapVertIcon from '@mui/icons-material/SwapVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EastIcon from '@mui/icons-material/East';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import styles from './Table.module.scss';
import { useTableUi } from './hooks/useTableUi';
import { TableUiProps } from './types';

export const TableUi = <T extends { uid: string | number }>(props: TableUiProps<T>) => {
  const { columns, textempty, reminderConfig } = props;
  const { t } = useTranslation();

  const {
    currentPage,
    rowsPerPage,
    totalPages,
    sortConfig,
    dataToRender,
    paginationItems,
    handleSort,
    handleRowsPerPageChange,
    handlePageChange,
  } = useTableUi(props);

  const getSortIcon = (key: keyof T | 'actions') => {
    if (!sortConfig || sortConfig.key !== key) return <SwapVertIcon />;
    return sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />;
  };

  return (
    <div className={styles['table-wrapper']}>
      <div className={styles['table-toolbar']}>
        <div className={styles['table-toolbar__info']}>
          {t('appAdmin.reservationsTable.resultText', 'Mostrar')}
          <div className={styles['table-toolbar__select-container']}>
            <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
              {['5', '10', '25', '50'].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles['table-responsive']}>
        <table className={styles['table-main']}>
          <thead className={styles['table-main__header']}>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.accessor)}
                  className={classNames(styles['table-main__th'], {
                    [styles['table-main__th--sortable']]: column.sortable,
                  })}
                  onClick={() => column.sortable && handleSort(column.accessor as keyof T)}
                >
                  <div className={styles['table-main__th-content']}>
                    <span className={styles['table-main__eyebrow']}>{column.header}</span>
                    {column.sortable && (
                      <span className={styles['table-main__sort-icon']}>
                        {getSortIcon(column.accessor)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles['table-main__body']}>
            {dataToRender.length > 0 ? (
              dataToRender.map((item) => {
                const isReminded = reminderConfig?.checkIsActive(item);
                return (
                  <tr 
                    key={item.uid} 
                    className={classNames(styles['table-main__row'], {
                      [styles['table-main__row--reminded']]: isReminded 
                    })}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        data-label={column.header}
                        key={`${item.uid}-${String(column.accessor)}`}
                        className={styles['table-main__cell']}
                      >
                        <div className={styles['table-main__cell-wrapper']}>
                          {colIndex === 0 && isReminded && reminderConfig && (
                            <ReminderIcon config={reminderConfig} item={item} />
                          )}
                          <span className={styles['table-main__cell-text']}>
                            {column.render ? column.render(item) : (item[column.accessor as keyof T] as React.ReactNode)}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <EmptyState colSpan={columns.length} text={textempty || t('appAdmin.table.noDataFound')} />
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <PaginationNav 
          currentPage={currentPage} 
          totalPages={totalPages} 
          items={paginationItems} 
          onPageChange={handlePageChange} 
          t={t} 
        />
      )}
    </div>
  );
};

const ReminderIcon = ({ config, item }: { config: any, item: any }) => (
  <div className={styles['reminder']}>
    <button className={styles['reminder__btn']} onClick={() => config.onToggle(item)} type="button">
      <NotificationsActiveIcon sx={{ fontSize: 18 }} />
    </button>
    <div className={styles['reminder__tooltip']}>
      <div className={styles['reminder__tooltip-inner']}>
        <InfoOutlinedIcon sx={{ fontSize: 16, color: '#82B194' }} />
        <div className={styles['reminder__tooltip-text']}>
          <strong>{config.tooltipTitle}</strong>
          <p>{config.tooltipMessage}</p>
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = ({ colSpan, text }: { colSpan: number, text: string }) => (
  <tr className={styles['table-main__empty-row']}>
    <td className={styles['table-main__empty']} colSpan={colSpan}>
      <div className={styles['table-main__empty-state']}>
        <InfoOutlinedIcon sx={{ fontSize: 40, opacity: 0.2, mb: 1 }} />
        <p>{text}</p>
      </div>
    </td>
  </tr>
);

const PaginationNav = ({ currentPage, totalPages, items, onPageChange, t }: any) => (
  <div className={styles['table-footer']}>
    <p className={styles['table-footer__info']}>
      {t('appAdmin.table.showingPage', { currentPage, totalPages })}
    </p>
    <nav className={styles['pagination']}>
      {items.map((item: any, index: number) => (
        typeof item === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(item)}
            className={classNames(styles['pagination__btn'], { [styles['pagination__btn--active']]: currentPage === item })}
          >
            {item}
          </button>
        ) : (
          <span key={index} className={styles['pagination__dots']}>...</span>
        )
      ))}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={classNames(styles['pagination__btn'], styles['pagination__btn--arrow'])}
      >
        <EastIcon sx={{ fontSize: 18 }} />
      </button>
    </nav>
  </div>
);