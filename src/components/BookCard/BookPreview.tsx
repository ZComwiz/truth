import React from 'react';
import styles from '@site/src/components/BookCard/styles.module.css';

interface BookPreviewProps {
  content: string;
  bookId: string;
  version: string;
}

export function BookPreview({ content, bookId, version }: BookPreviewProps) {
  return (
    <div className={styles.preview}>
      <div className={styles.previewContent}>
        {content}
      </div>
      <div className={styles.fadeOut} />
      <a 
        href={`/docs/${bookId}/v${version}`}
        className={styles.readButton}
      >
        Continue Reading
      </a>
    </div>
  );
} 