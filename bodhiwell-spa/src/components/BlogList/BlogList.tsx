import  { useMemo } from 'react';
import styles from './BlogList.module.scss';
import { TableUi } from '../ui/Table/TableUi';
import Loading from '../ui/Loading/Loading';
import { AdvancedFilters } from '../ui/AdvancedFilters/AdvancedFilters';
import { ButtonUi } from '../ui/ButtonUi/ButtonUi';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import { useBlogList } from './hooks/useBlogList';
import { getBlogColumns } from './config';

export const BlogList = () => {
  const {
    t, navigate, loading, error, posts, filteredData,
    searchTerm, setSearchTerm, startDate, setStartDate,
    endDate, setEndDate, period, handlePeriodChange,
    deleteDialogOpen, setDeleteDialogOpen, handleDeleteClick, confirmDelete,
  } = useBlogList();

  const columns = useMemo(
    () => getBlogColumns({ t, styles, navigate, onDelete: handleDeleteClick }),
    [t, navigate, handleDeleteClick]
  );

  if (loading && posts.length === 0) {
    return <Loading fullscreen text={t('appAdmin.blog.loading')} />;
  }

  return (
    <div className={styles['blog-list']}>


      
      <div className={styles['blog-list__utility-bar']}>
        <ButtonUi
          variant="contained"
          onClick={() => navigate('/blog/create')}
          className={styles['blog-list__add-btn']}
        >
          {t('appAdmin.blog.create.submit', 'Nuevo artículo')}
        </ButtonUi>
      </div>

      <div className={styles['blog-list__filters']}>
        <AdvancedFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          period={period}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      <div className={styles['blog-list__table-container']}>
        {error ? (
          <div className={styles['blog-list__error']}>{error}</div>
        ) : (
          <TableUi
            columns={columns}
            data={filteredData}
            textempty={t('appAdmin.blog.emptyText')}
          />
        )}
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title={t('appAdmin.blog.deleteConfirmationTitle')}
        message={t('appAdmin.blog.deleteConfirmation')}
        confirmText={t('appAdmin.blog.confirmDelete')}
        cancelText={t('appAdmin.blog.cancel')}
      />
    </div>
  );
};