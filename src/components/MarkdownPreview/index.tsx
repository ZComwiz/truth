import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './styles.module.css';

interface MarkdownPreviewProps {
  content: string;
  maxLength?: number;
}

export function MarkdownPreview({ content, maxLength = 300 }: MarkdownPreviewProps): JSX.Element {
  // Get the first few paragraphs that fit within maxLength
  const truncatedContent = React.useMemo(() => {
    const paragraphs = content.split('\n\n');
    let currentLength = 0;
    let selectedParagraphs = [];
    
    for (const paragraph of paragraphs) {
      if (currentLength + paragraph.length <= maxLength) {
        selectedParagraphs.push(paragraph);
        currentLength += paragraph.length;
      } else {
        // Add partial paragraph if we haven't added any yet
        if (selectedParagraphs.length === 0) {
          selectedParagraphs.push(paragraph.slice(0, maxLength) + '...');
        }
        break;
      }
    }
    
    return selectedParagraphs.join('\n\n');
  }, [content, maxLength]);

  return (
    <div className={styles.preview}>
      <ReactMarkdown>{truncatedContent}</ReactMarkdown>
    </div>
  );
} 