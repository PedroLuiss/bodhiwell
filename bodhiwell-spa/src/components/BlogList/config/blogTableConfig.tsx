import dayjs from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ActionMenu from '../../ui/ActionMenu/ActionMenu';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import { BlogPost, BlogStatus } from '../../../types/Blog/Blog.type';
import { TFunction } from 'i18next';
import { ColumnDefinitionTableUi } from '../../ui/Table/types';

interface ConfigProps {
  t: TFunction | ((key: string, defaultValue?: string) => string);
  styles: any;
  navigate: (path: string) => void;
  onDelete: (id: number) => void;
}

export const getBlogColumns = ({
  t,
  styles,
  navigate,
  onDelete,
}: ConfigProps): ColumnDefinitionTableUi<BlogPost>[] => [
  {
    header: t('appAdmin.blog.headerTitle.title', 'Título') as string,
    accessor: 'title',
    sortable: true,
    render: (item) => (
      <div className={styles['blog-title-cell']}>
        {item.image && <img src={item.image} alt={item.title} className={styles['blog-thumb']} />}
        <span>{item.title}</span>
      </div>
    ),
  },
  {
    header: t('appAdmin.blog.headerTitle.status', 'Estado') as string,
    accessor: 'status',
    sortable: true,
    render: (item) => <StatusBadge status={item.status as BlogStatus} />,
  },
  {
    header: t('appAdmin.blog.headerTitle.date', 'Fecha de publicación') as string,
    accessor: 'date',
    sortable: true,
    render: (item) => dayjs(item.date).format('DD/MM/YYYY'),
  },
  {
    header: t('appAdmin.blog.headerTitle.actions', 'Acciones') as string,
    accessor: 'actions',
    render: (item) => {
      const menuOptions = [
        <button
          key="view"
          className={styles['action-button']}
          onClick={() => window.open(item.link, '_blank')}
        >
          <VisibilityIcon />
          {t('appAdmin.blog.viewInBlog', 'Ver en Blog')}
        </button>,
        <button
          key="edit"
          className={styles['action-button']}
          onClick={() => navigate(`/blog/edit/${item.id}`)}
        >
          <EditIcon />
          {t('appAdmin.blog.edit', 'Editar')}
        </button>,
        <button
          key="delete"
          className={styles['action-button']}
          onClick={() => onDelete(item.id)}
        >
          <DeleteIcon />
          {t('appAdmin.blog.delete', 'Eliminar')}
        </button>,
      ];
      return <ActionMenu options={menuOptions} />;
    },
  },
];