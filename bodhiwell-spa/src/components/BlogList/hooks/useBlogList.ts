import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BlogPost } from '../../../types/Blog/Blog.type';
import { useAuthContext } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { blogService } from '../../../services/blogService';
import { useDataFilter } from '../../../hooks/useDataFilter';

export const useBlogList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { showNotification } = useNotification();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await blogService.getPosts();
      const formattedData = data.map((post: any) => ({
        ...post,
        uid: post.id,
      }));
      setPosts(formattedData);
    } catch (err) {
      setError(t('appAdmin.blog.errorLoading', 'Error al cargar los artículos.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (user?.type_account === 'professional') {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  const handleDeleteClick = useCallback((id: number) => {
    setPostToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (postToDelete !== null) {
      try {
        await blogService.deletePost(postToDelete);
        setPosts((current) => current.filter((p) => p.id !== postToDelete));
        showNotification(t('appAdmin.blog.deleteSuccess', 'Artículo eliminado correctamente'), 'success');
      } catch (err) {
        showNotification(t('appAdmin.blog.deleteError', 'Error al eliminar el artículo'), 'error');
      } finally {
        setDeleteDialogOpen(false);
        setPostToDelete(null);
      }
    }
  };

  const filterControls = useDataFilter<BlogPost>({
    data: posts,
    searchKeys: ['title', 'excerpt'],
    dateKey: 'date',
  });

  return {
    t,
    navigate,
    loading,
    error,
    posts,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDeleteClick,
    confirmDelete,
    ...filterControls,
  };
};