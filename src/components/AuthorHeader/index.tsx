import React from 'react';
import styles from './styles.module.css';

interface AuthorHeaderProps {
  author: string;
  date: string;
  image?: string;
  title?: string;
}

export default function AuthorHeader({ author, date, image, title }: AuthorHeaderProps): JSX.Element {
  return (
    <div 
      data-author-header 
      data-image={image}
      data-title={title}
    >
      <div className={styles.header}>
        <img src={image} alt="Book Cover" className={styles.coverImage} />
        <div className={styles.metadata}>
          <div className={styles.author}>By {author}</div>
          <div className={styles.date}>Last revised: {date}</div>
        </div>
      </div>
    </div>
  );
}
