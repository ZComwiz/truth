import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from '@docusaurus/router';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChatCircleText } from '@phosphor-icons/react';
import { TextSelector } from '../TextSelector';
import styles from './styles.module.css';

interface ReadingProgressProps {
  children: React.ReactNode;
  coverImage?: string;
  title?: string;
  author?: string;
}

export function ReadingProgress({ children, coverImage, title, author }: ReadingProgressProps): JSX.Element {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  
  const isDocPage = location.pathname.includes('/docs/');
  const x = useMotionValue(0);
  const width = useTransform(x, [0, 100], ['0%', '100%']);

  const calculateProgress = useCallback(() => {
    const element = document.documentElement;
    const totalHeight = element.scrollHeight - element.clientHeight;
    const scrolled = element.scrollTop;
    const currentProgress = (scrolled / totalHeight) * 100;
    setProgress(currentProgress);
    x.set(currentProgress);
    
    localStorage.setItem(`reading-progress-${location.pathname}`, currentProgress.toString());
  }, [location.pathname, x]);

  const setProgressFromClick = useCallback((clientX: number) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = clientX - rect.left;
    const newProgress = (clickPosition / rect.width) * 100;
    const boundedProgress = Math.max(0, Math.min(100, newProgress));
    
    setProgress(boundedProgress);
    x.set(boundedProgress);
    
    const element = document.documentElement;
    const totalHeight = element.scrollHeight - element.clientHeight;
    const newScrollPosition = (boundedProgress / 100) * totalHeight;
    
    window.scrollTo({
      top: newScrollPosition,
      behavior: 'smooth'
    });
  }, [x]);

  const handleClick = (e: React.MouseEvent) => {
    setProgressFromClick(e.clientX);
  };

  useEffect(() => {
    if (!isDocPage) return;

    window.addEventListener('scroll', calculateProgress);

    return () => {
      window.removeEventListener('scroll', calculateProgress);
    };
  }, [isDocPage, calculateProgress]);

  const handleShowNotes = useCallback((value: boolean) => {
    if (!value) {
      document.querySelectorAll(`.${styles.highlightedSelection}`).forEach(el => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent || ''), el);
        }
      });
    }
    window.getSelection()?.removeAllRanges();
    setShowNotes(value);
  }, []);

  console.log('ReadingProgress props:', { coverImage, title });

  return (
    <>
      {children}
      {isDocPage && (
        <div className={styles.progressContainer}>
          {(coverImage || title) && (
            <div className={styles.bookInfo}>
              <div className={styles.bookInfoContent}>
                {coverImage && (
                  <motion.div
                    className={styles.imageWrapper}
                    onHoverStart={() => setIsImageExpanded(true)}
                    onHoverEnd={() => setIsImageExpanded(false)}
                  >
                    <motion.img 
                      src={coverImage} 
                      alt={title || 'Book cover'} 
                      className={styles.coverImage}
                      animate={{
                        width: isImageExpanded ? 200 : 48,
                        height: isImageExpanded ? 200 : 48,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ originX: 0, originY: 1 }}
                    />
                  </motion.div>
                )}
                {title && <div className={styles.title}>{title}</div>}
              </div>
            </div>
          )}
          
          <div 
            ref={progressBarRef}
            className={styles.progressBar}
            onClick={handleClick}
          >
            <motion.div 
              className={styles.progressFill}
              style={{ width }}
            />
          </div>
          
          <button 
            className={styles.notesButton}
            onClick={() => handleShowNotes(!showNotes)}
            aria-label={showNotes ? 'Close notes' : 'Open notes'}
          >
            <ChatCircleText 
              size={28} 
              weight={showNotes ? "fill" : "regular"}
            />
          </button>
        </div>
      )}
      <TextSelector 
        key={location.pathname}
        isVisible={showNotes} 
        setIsVisible={handleShowNotes}
        bookTitle={title || ''}
        author={author || ''}
        container=".theme-doc-markdown"
      />
    </>
  );
} 