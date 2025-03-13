import React from 'react';
import { DiffViewer } from '../DiffViewer';
import styles from '@site/src/components/BookCard/styles.module.css';

interface VersionControlProps {
  bookId: string;
  versions: string[];
  currentVersion: string;
  onVersionSelect: (version: string) => void;
  onClose: () => void;
}

export function VersionControl({
  bookId,
  versions,
  currentVersion,
  onVersionSelect,
  onClose
}: VersionControlProps) {
  return (
    <div className={styles.versionControl}>
      <div className={styles.versionHeader}>
        <h3>Version History</h3>
        <button onClick={onClose} className={styles.closeButton}>×</button>
      </div>
      
      <div className={styles.versionList}>
        {versions.map(version => (
          <button
            key={version}
            className={clsx(
              styles.versionItem,
              version === currentVersion && styles.currentVersion
            )}
            onClick={() => onVersionSelect(version)}
          >
            v{version}
          </button>
        ))}
      </div>
      
      <DiffViewer bookId={bookId} />
    </div>
  );
} 