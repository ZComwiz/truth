import React from 'react';
import styles from './styles.module.css';

interface VersionedBookProps {
  id: string;
}

export function VersionedBook({ id }: VersionedBookProps) {
  return (
    <div className={styles.bookCard}>
      <div>
        <div>
          <h2>God is Real: Here's the Proof</h2>
          <p>A philosophical proof of God's existence</p>
        </div>
        <div>
          <button className="button button--secondary">v1.0.2 ▼</button>
        </div>
      </div>
      <div>
        <div>
          <img src="/img/GodIsRealCover.png" alt="God is Real: Here's the Proof" />
        </div>
        <div className={styles.preview}>
          <div className={styles.previewContent}>
            A philosophical proof of God's existence
          </div>
          <div className={styles.fadeOut} />
          <a 
            className="button button--primary"
            href="/docs/god-is-real/v1.0.2"
          >
            Continue Reading
          </a>
        </div>
      </div>
      <div>
        <div>
          <span>Version 1.0.2</span>
          <span>Updated: 2024-11-22</span>
        </div>
      </div>
    </div>
  );
}