import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageContentLayout } from '../../../components/ui/layout/PageContentLayout/PageContentLayout';
import DocumentIcon from '@mui/icons-material/Description';
import { TextFieldUi } from '../../../components/ui/TextFieldUi/TextFieldUi';
import { TextAreaUi } from '../../../components/ui/TextAreaUi/TextAreaUi';
import { ButtonUi } from '../../../components/ui/ButtonUi/ButtonUi';
import { SelectUi } from '../../../components/ui/SelectUi/SelectUi';
import MenuItem from '@mui/material/MenuItem';
import { FileDropzone } from '../../../components/ui/FileDropzone/FileDropzone';
import { blogService } from '../../../services/blogService';
import CircularProgress from '@mui/material/CircularProgress';
import { useNotification } from '../../../context/NotificationContext';
import Loading from '../../../components/ui/Loading/Loading';
import styles from '../CreateBlogPost/CreateBlogPost.module.scss';
import CustomQuillEditor from '../../../components/ui/TextEditorUi/CustomQuillEditor';
import { BlogCategories } from '../../../constants/blogConstants';

const EditBlogPost = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { showNotification } = useNotification();

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('publish');
    const [category, setCategory] = useState(BlogCategories[0]);
    const [image, setImage] = useState<File | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);

    // Glossary Section
    const [glossaryTitle, setGlossaryTitle] = useState('');
    const [glossaryIntro, setGlossaryIntro] = useState('');
    const [glossary, setGlossary] = useState<{ term: string; description: string }[]>([]);

    // Sources Section
    const [sourcesTitle, setSourcesTitle] = useState('');
    const [sourcesIntro, setSourcesIntro] = useState('');
    const [sources, setSources] = useState<{ label: string; content: string }[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            try {
                const posts = await blogService.getPosts();
                const post = posts.find((p: any) => p.id === parseInt(id));
                if (post) {
                    setTitle(post.title);
                    setSubtitle(post.subtitle || '');
                    setExcerpt(post.excerpt || '');
                    setContent(post.content || '');
                    setStatus(post.status);
                    if (post.category && BlogCategories.includes(post.category)) {
                        setCategory(post.category);
                    } else if (post.category) {
                        // If category exists but not in list, we could either add it or ignore it.
                        // For now let's just use it if it's there.
                        setCategory(post.category);
                    }
                    setExistingImage(post.image);

                    // Glossary fields
                    setGlossaryTitle(post.glossary_title || '');
                    setGlossaryIntro(post.glossary_intro || '');
                    setGlossary(post.glossary || []);

                    // Sources fields
                    setSourcesTitle(post.sources_title || '');
                    setSourcesIntro(post.sources_intro || '');
                    setSources(post.sources || []);
                } else {
                    setError(t('blog.edit.errorNotFound', 'No se encontró el artículo.'));
                }
            } catch (err) {
                console.error('Error fetching post:', err);
                setError(t('blog.edit.errorLoading', 'Error al cargar el artículo.'));
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, t]);

    const handleFileSelected = (file: File | null) => {
        setImage(file);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleAddGlossaryItem = () => {
        setGlossary([...glossary, { term: '', description: '' }]);
    };

    const handleRemoveGlossaryItem = (index: number) => {
        const newGlossary = glossary.filter((_, i) => i !== index);
        setGlossary(newGlossary);
    };

    const handleGlossaryChange = (index: number, field: 'term' | 'description', value: string) => {
        const newGlossary = [...glossary];
        newGlossary[index][field] = value;
        setGlossary(newGlossary);
    };

    const handleAddSourceItem = () => {
        setSources([...sources, { label: '', content: '' }]);
    };

    const handleRemoveSourceItem = (index: number) => {
        const newSources = sources.filter((_, i) => i !== index);
        setSources(newSources);
    };

    const handleSourceChange = (index: number, field: 'label' | 'content', value: string) => {
        const newSources = [...sources];
        newSources[index][field] = value;
        setSources(newSources);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        if (!title.trim() || !content.trim()) {
            setError(t('appAdmin.blog.editBlog.errorEmptyFields', 'Por favor, completa el título y el contenido.'));
            return;
        }

        setSaving(true);
        setError(null);

        try {
            let imageBase64 = null;
            if (image) {
                imageBase64 = await fileToBase64(image);
            }

            await blogService.updatePost(parseInt(id), {
                title,
                subtitle,
                excerpt,
                content,
                status,
                image: imageBase64,
                glossary_title: glossaryTitle,
                glossary_intro: glossaryIntro,
                glossary,
                sources_title: sourcesTitle,
                sources_intro: sourcesIntro,
                sources,
                category,
            });

            showNotification(t('appAdmin.blog.editBlog.success', 'Artículo actualizado correctamente'), 'success');
            setTimeout(() => {
                navigate('/blog');
            }, 1500);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || t('appAdmin.blog.editBlog.errorGeneric', 'Hubo un error al actualizar el artículo.'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loading fullscreen text={t('appAdmin.blog.editBlog.loading', 'Cargando...')} />;
    }

    return (
        <PageContentLayout
            title={t('appAdmin.blog.editBlog.title', 'Editar artículo')}
            icon={DocumentIcon}
        >
            <div className={styles['create-blog-container']}>
                <form className={styles['create-blog-form']} onSubmit={handleSubmit}>
                    <div className={styles['form-card']}>
                        {error && <div className={styles['error-message']}>{error}</div>}

                        <div className={styles['form-field']}>
                            <TextFieldUi
                                label={t('appAdmin.blog.create.fieldTitle', 'Título del artículo')}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('appAdmin.blog.create.titlePlaceholder', 'Escribe un título impactante...')}
                                fullWidth
                                required
                                size='small'
                            />
                        </div>

                        <div className={styles['form-field']}>
                            <TextFieldUi
                                label={t('appAdmin.blog.create.subtitle', 'Subtítulo')}
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                placeholder={t('appAdmin.blog.create.subtitlePlaceholder', 'Un subtítulo que complemente el título...')}
                                fullWidth
                                size='small'
                            />
                        </div>

                        <div className={styles['form-field']}>
                            <TextAreaUi
                                label={t('appAdmin.blog.create.description', 'Descripción corta (Excerpt)')}
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder={t('appAdmin.blog.create.descriptionPlaceholder', 'Escribe una breve descripción para el listado...')}
                                fullWidth
                                size='small'
                            />
                        </div>

                        <div className={styles['form-field']}>
                            <SelectUi
                                label={t('appAdmin.blog.create.fieldStatus', 'Estado')}
                                value={status}
                                onChange={(e: any) => setStatus(e.target.value)}
                            >
                                <MenuItem value="publish">{t('appAdmin.blog.create.status.published', 'Publicado')}</MenuItem>
                                <MenuItem value="trash">{t('appAdmin.blog.create.status.trash', 'Papelera')}</MenuItem>
                            </SelectUi>
                        </div>

                        <div className={styles['form-field']}>
                            <SelectUi
                                label={t('appAdmin.blog.create.fieldCategory', 'Categoría')}
                                value={category}
                                onChange={(e: any) => setCategory(e.target.value)}
                            >
                                {BlogCategories.map((cat) => (
                                    <MenuItem key={cat} value={cat}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </SelectUi>
                        </div>

                        <div className={styles['form-field']}>
                            <label className={styles['field-label']}>{t('appAdmin.blog.create.fieldImage', 'Imagen destacada')}</label>
                            {existingImage && !image && (
                                <div style={{ marginBottom: '10px' }}>
                                    <p style={{ fontSize: '12px', color: '#666' }}>{t('appAdmin.blog.editBlog.currentImage', 'Imagen actual:')}</p>
                                    <img src={existingImage} alt="Current" style={{ width: '100px', borderRadius: '4px' }} />
                                </div>
                            )}
                            <FileDropzone
                                onFileSelected={handleFileSelected}
                                acceptedFileTypes={{ 'image/jpeg': [], 'image/png': [], 'image/webp': [] }}
                            />
                        </div>

                        <div className={styles['form-field']}>
                            <label className={styles['field-label']}>{t('appAdmin.blog.create.fieldContent', 'Contenido del artículo')}</label>
                            <CustomQuillEditor
                                value={content}
                                onChange={setContent}
                                placeholder={t('appAdmin.blog.create.contentPlaceholder', 'Escribe tu artículo aquí...')}
                            />
                        </div>

                        {/* Glossary Section */}
                        <div className={styles['section-divider']} />
                        <h3 className={styles['section-title']}>{t('appAdmin.blog.create.glossary.sectionTitle', 'Glosario')}</h3>

                        <div className={styles['form-field']}>
                            <TextFieldUi
                                label={t('appAdmin.blog.create.glossary.title', 'Título del glosario')}
                                value={glossaryTitle}
                                onChange={(e) => setGlossaryTitle(e.target.value)}
                                fullWidth
                                size='small'
                            />
                        </div>

                        <div className={styles['form-field']}>
                            <TextAreaUi
                                label={t('appAdmin.blog.create.glossary.intro', 'Introducción')}
                                value={glossaryIntro}
                                onChange={(e) => setGlossaryIntro(e.target.value)}
                                fullWidth
                                size='small'
                            />
                        </div>

                        <div className={styles['dynamic-list']}>
                            {glossary.map((item, index) => (
                                <div key={index} className={styles['list-item']}>
                                    <TextFieldUi
                                        label={t('appAdmin.blog.create.glossary.itemTerm', 'Término')}
                                        value={item.term}
                                        onChange={(e) => handleGlossaryChange(index, 'term', e.target.value)}
                                        fullWidth
                                        size='small'
                                    />
                                    <TextAreaUi
                                        label={t('appAdmin.blog.create.glossary.itemDescription', 'Descripción')}
                                        value={item.description}
                                        onChange={(e) => handleGlossaryChange(index, 'description', e.target.value)}
                                        fullWidth
                                        size='small'
                                    />
                                    <ButtonUi
                                        type="button"
                                        variant="text"
                                        color="error"
                                        onClick={() => handleRemoveGlossaryItem(index)}
                                    >
                                        {t('appAdmin.blog.create.glossary.remove', 'Quitar')}
                                    </ButtonUi>
                                </div>
                            ))}
                            <ButtonUi
                                type="button"
                                variant="outlined"
                                onClick={handleAddGlossaryItem}
                                className={styles['add-button']}
                            >
                                {t('appAdmin.blog.create.glossary.add', '+ Añadir Término')}
                            </ButtonUi>
                        </div>

                        {/* Sources Section */}
                        <div className={styles['section-divider']} />
                        <h3 className={styles['section-title']}>{t('appAdmin.blog.create.sources.sectionTitle', 'Fuentes')}</h3>

                        <div className={styles['form-field']}>
                            <TextFieldUi
                                label={t('appAdmin.blog.create.sources.title', 'Título de fuentes')}
                                value={sourcesTitle}
                                onChange={(e) => setSourcesTitle(e.target.value)}
                                fullWidth
                                size='small'
                            />
                        </div>

                        <div className={styles['form-field']}>
                            <TextAreaUi
                                label={t('appAdmin.blog.create.sources.intro', 'Introducción')}
                                value={sourcesIntro}
                                onChange={(e) => setSourcesIntro(e.target.value)}
                                fullWidth
                                size='small'
                            />
                        </div>

                        <div className={styles['dynamic-list']}>
                            {sources.map((item, index) => (
                                <div key={index} className={styles['list-item']}>
                                    <TextFieldUi
                                        label={t('appAdmin.blog.create.sources.itemLabel', 'Etiqueta/Nombre')}
                                        value={item.label}
                                        onChange={(e) => handleSourceChange(index, 'label', e.target.value)}
                                        fullWidth
                                        size='small'
                                    />
                                    <TextFieldUi
                                        label={t('appAdmin.blog.create.sources.itemContent', 'Contenido/Link')}
                                        value={item.content}
                                        onChange={(e) => handleSourceChange(index, 'content', e.target.value)}
                                        fullWidth
                                        size='small'
                                    />
                                    <ButtonUi
                                        type="button"
                                        variant="text"
                                        color="error"
                                        onClick={() => handleRemoveSourceItem(index)}
                                    >
                                        {t('appAdmin.blog.create.sources.remove', 'Quitar')}
                                    </ButtonUi>
                                </div>
                            ))}
                            <ButtonUi
                                type="button"
                                variant="outlined"
                                onClick={handleAddSourceItem}
                                className={styles['add-button']}
                            >
                                {t('appAdmin.blog.create.sources.add', '+ Añadir Fuente')}
                            </ButtonUi>
                        </div>

                        <div className={styles['form-actions']}>
                            <ButtonUi
                                type="button"
                                variant="outlined"
                                color="secondary"
                                onClick={() => navigate('/blog')}
                                disabled={saving}
                            >
                                {t('appAdmin.blog.create.cancel', 'Cancelar')}
                            </ButtonUi>
                            <ButtonUi
                                type="submit"
                                variant="contained"
                                color="secondary"
                                disabled={saving}
                            >
                                {saving ? <CircularProgress size={20} color="inherit" /> : t('appAdmin.blog.editBlog.save', 'Guardar')}
                            </ButtonUi>
                        </div>
                    </div>
                </form>
            </div>
        </PageContentLayout>
    );
};

export default EditBlogPost;
