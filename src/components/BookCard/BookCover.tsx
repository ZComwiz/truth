import React from 'react';
import styles from '@site/src/components/BookCard/styles.module.css';

interface BookCoverProps {
  image: string;
  title: string;
  author: string;
}

export function BookCover({ image, title, author }: BookCoverProps) {
  return (
    <div className={styles.coverContainer}>
      <img 
        src={image} 
        alt={`${title} by ${author}`}
        className={styles.coverImage}
      />
    </div>
  );
} 