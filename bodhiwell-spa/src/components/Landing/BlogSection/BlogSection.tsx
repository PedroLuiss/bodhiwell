import styles from './BlogSection.module.scss';
import BlogCard from './BlogCard';
import { blogPosts } from '../../../config/Landing/BlogSection';

export const BlogSection = () => {
  return (
    <section className={styles['blog-section']}>
      <div className={styles['blog-section__container']}>
        <div className={styles['blog-section__header']}>
          <p className={styles['blog-section__eyebrow']}>BLOG</p>
          <h2 className={styles['blog-section__heading']}>DESCUBRE LO NUEVO</h2>
          <p className={styles['blog-section__description']}>
            Explora las últimas publicaciones de la red de profesionales y accede al blog completo para más contenido sobre integridad, cuidado y atención.
          </p>
        </div>

        <div className={styles['blog-section__grid']}>
          {blogPosts.map(post => (
            <BlogCard
              key={post.id}
              mediaType={post.mediaType}
              mediaSrc={post.mediaSrc}
              posterSrc={post.posterSrc}
              title={post.title}
              description={post.description}
              linkUrl={post.linkUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
