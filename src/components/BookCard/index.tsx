import React from 'react';
import { BookCover } from './BookCover';
import { BookHeader } from './BookHeader';
import { BookPreview } from './BookPreview';
import { BookMetadata } from './BookMetadata';
import { VersionControl } from './VersionControl';
import { useVersionContent, useBookVersions } from '@site/src/utils/contentLoader';
import styles from '@site/src/components/BookCard/styles.module.css';

interface BookCardProps {
  bookId: string;
  initialVersion?: string;
}

export function BookCard({ bookId, initialVersion }: BookCardProps) {
  const { data: versions = [] } = useBookVersions(bookId);
  const [selectedVersion, setSelectedVersion] = React.useState(initialVersion || versions[0]);
  const [showVersioning, setShowVersioning] = React.useState(false);
  
  const { data, isLoading } = useVersionContent(bookId, selectedVersion);

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!data) {
    return <div className={styles.error}>Book not available</div>;
  }

  return (
    <article className={styles.bookCard}>
      <BookHeader
        title={data.title}
        description={data.description}
        version={data.version}
        onVersionClick={() => setShowVersioning(!showVersioning)}
      />
      
      <div className={styles.content}>
        <BookCover 
          image={data.image}
          title={data.title}
          author={data.author}
        />
        
        <BookPreview
          content={data.rawContent}
          bookId={bookId}
          version={data.version}
        />
      </div>

      <BookMetadata
        version={data.version}
        date={data.date}
        author={data.author}
      />

      {showVersioning && (
        <VersionControl
          bookId={bookId}
          versions={versions}
          currentVersion={selectedVersion}
          onVersionSelect={setSelectedVersion}
          onClose={() => setShowVersioning(false)}
        />
      )}
    </article>
  );
} 