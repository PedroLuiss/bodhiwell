import styles from './BlogCard.module.scss';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

type BlogCardProps = {
  mediaType: 'video' | 'image';
  mediaSrc: string|undefined;
  posterSrc?: string; 
  title: string;
  description: string;
  linkUrl: string;
}

const BlogCard = ({ mediaType, mediaSrc, posterSrc, title, description, linkUrl } : BlogCardProps) => {
  return (
    <article className={styles['blog-card']}>
      <div className={styles['blog-card__media-wrapper']}>
        {mediaType === 'video' ? (
          <video 
            className={styles['blog-card__media']}
            src={mediaSrc} 
            poster={posterSrc}
            controls 
          />
        ) : (
          <img 
            className={styles['blog-card__media']}
            src={mediaSrc} 
            alt={title} 
          />
        )}
      </div>
      <div className={styles['blog-card__content']}>
        <h3 className={styles['blog-card__title']}>{title}</h3>
        <p className={styles['blog-card__description']}>{description}</p>
        <a href={linkUrl} className={styles['blog-card__link']}>
          Ir a ver <NavigateNextIcon/>
        </a>
      </div>
    </article>
  );
};

export default BlogCard;