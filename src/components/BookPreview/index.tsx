import React from 'react';
import styles from './styles.module.css';

interface BookPreviewProps {
  data?: {
    description?: string;
    title?: string;
    version?: string;
    date?: string;
    image?: string;
    rawContent?: string;
  };
  bookId: string;
  isLoading?: boolean;
  onVersionClick?: () => void;
}

export function BookPreview({ data, bookId, isLoading, onVersionClick }: BookPreviewProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No content available</div>;
  }

  return (
    <>
      <div className={styles.header}>
        <div>
          <h2>{data.title}</h2>
          <p>{data.description}</p>
        </div>
        <div>
          <button 
            className={`button button--secondary ${styles.versionButton}`}
            onClick={onVersionClick}
          >
            v{data.version || '0.0.0'} ▼
          </button>
        </div>
      </div>
      <div className={styles.content}>
        {data.image && (
          <div className={styles.imageContainer}>
            <img src={data.image} alt={data.title || 'Book cover'} />
          </div>
        )}
        <div className={styles.preview}>
          <div className={styles.previewContent}>
            {data.rawContent || data.description || 'Preview not available'}
          </div>
          <div className={styles.fadeOut} />
          <a 
            className={`button button--primary ${styles.readButton}`} 
            href={`/docs/${bookId}/v${data.version}`}
          >
            Continue Reading
          </a>
        </div>
      </div>
      <div className={styles.metadata}>
        <div className={styles.versionInfo}>
          <span className={styles.version}>Version {data.version || '0.0.0'}</span>
          <span className={styles.lastUpdated}>Updated: {data.date || 'Unknown date'}</span>
        </div>
      </div>
    </>
  );
} 