import React from 'react';
import styles from '@site/src/components/BookCard/styles.module.css';

interface BookMetadataProps {
  version: string;
  date: string;
  author: string;
}

export function BookMetadata({ version, date, author }: BookMetadataProps) {
  return (
    <footer className={styles.metadata}>
      <div className={styles.metadataGroup}>
        <span className={styles.version}>Version {version}</span>
        <span className={styles.date}>Updated: {date}</span>
      </div>
      <span className={styles.author}>By {author}</span>
    </footer>
  );
} 