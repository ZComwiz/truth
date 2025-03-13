import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from '@docusaurus/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MDXProvider } from '@mdx-js/react';
import { ReadingProgress } from '@site/src/components/ReadingProgress';
import { MetadataContext } from '../context/MetadataContext';

const queryClient = new QueryClient();

export default function Root({ children }) {
  const location = useLocation();
  const isDocPage = location.pathname.includes('/docs/');
  const contentRef = useRef(null);
  const [metadata, setMetadata] = React.useState({ coverImage: '', title: '' });
  const [contentLoaded, setContentLoaded] = useState(false);
  const [isHighlightPending, setIsHighlightPending] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);

  useEffect(() => {
    if (isDocPage && contentRef.current) {
      try {
        // Find the main content div
        const mainContent = contentRef.current.querySelector('.main-wrapper');
        console.log('Main content element:', mainContent);

        if (mainContent) {
          // Look for AuthorHeader component
          const authorHeader = mainContent.querySelector('[data-author-header]');
          console.log('Author header:', authorHeader);

          if (authorHeader) {
            const image = authorHeader.getAttribute('data-image');
            const title = authorHeader.getAttribute('data-title');
            if (image || title) {
              setMetadata({
                coverImage: image || '',
                title: title || ''
              });
              return;
            }
          }

          // Look for article header
          const articleHeader = mainContent.querySelector('article header');
          console.log('Article header:', articleHeader);

          if (articleHeader) {
            // Try to find the title
            const titleElement = articleHeader.querySelector('h1');
            const title = titleElement?.textContent || '';

            // Try to find an image
            const image = articleHeader.querySelector('img');
            const coverImage = image?.src || '';

            setMetadata({ coverImage, title });
          }
        }
        setContentLoaded(true);
      } catch (error) {
        console.error('Error extracting metadata:', error);
      }
    }
  }, [isDocPage, location.pathname]);

  // Handle content loading
  useEffect(() => {
    if (isDocPage && contentRef.current) {
      const checkContent = () => {
        const container = contentRef.current?.querySelector('.theme-doc-markdown');
        if (container && container.textContent) {
          setIsContentReady(true);
        } else {
          // Keep checking until content is available
          setTimeout(checkContent, 100);
        }
      };
      
      checkContent();
    }
  }, [isDocPage]);

  // Handle URL parameters after content is ready
  useEffect(() => {
    if (isContentReady && isDocPage) {
      const params = new URLSearchParams(location.search);
      const start = parseInt(params.get('start') || '');
      const end = parseInt(params.get('end') || '');

      if (!isNaN(start) && !isNaN(end)) {
        const timer = setTimeout(() => {
          const container = contentRef.current?.querySelector('.theme-doc-markdown');
          if (container) {
            highlightTextRange(container, start, end);
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [isContentReady, location.search]);

  const highlightTextRange = (container: Element, start: number, end: number) => {
    try {
      // Clear any existing highlights first
      document.querySelectorAll('.highlighted-quote').forEach(el => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent || ''), el);
          parent.normalize();
        }
      });

      const range = document.createRange();
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null
      );

      let currentPos = 0;
      let startNode = null;
      let endNode = null;
      let startOffset = 0;
      let endOffset = 0;

      let node;
      while ((node = walker.nextNode())) {
        const length = node.textContent?.length || 0;
        
        if (!startNode && currentPos + length >= start) {
          startNode = node;
          startOffset = start - currentPos;
        }
        
        if (!endNode && currentPos + length >= end) {
          endNode = node;
          endOffset = end - currentPos;
          break;
        }
        
        currentPos += length;
      }

      if (startNode && endNode) {
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);

        const span = document.createElement('span');
        span.className = 'highlighted-quote';
        range.surroundContents(span);

        // Scroll with a longer delay and offset
        setTimeout(() => {
          span.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    } catch (err) {
      console.error('Failed to highlight text:', err);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <MetadataContext.Provider value={metadata}>
        <MDXProvider>
          <div ref={contentRef}>
            {isDocPage ? (
              <ReadingProgress 
                coverImage={metadata.coverImage} 
                title={metadata.title}
                onContentLoad={() => setContentLoaded(true)}
              >
                {children}
              </ReadingProgress>
            ) : children}
          </div>
        </MDXProvider>
      </MetadataContext.Provider>
    </QueryClientProvider>
  );
}