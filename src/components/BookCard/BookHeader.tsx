import React from 'react';
import styles from '@site/src/components/BookCard/styles.module.css';

interface BookHeaderProps {
  title: string;
  description: string;
  version: string;
  onVersionClick: () => void;
}

export function BookHeader({ title, description, version, onVersionClick }: BookHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
      <button 
        className={styles.versionButton}
        onClick={onVersionClick}
        aria-label="Select version"
      >
        v{version} ▼
      </button>
    </header>
  );
} 