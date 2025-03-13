import React from 'react';
import MDXContent from '@theme/MDXContent';
import { MDXProvider } from '@mdx-js/react';

interface MDXPreviewProps {
  content: string | React.ReactNode;
}

export function MDXPreview({ content }: MDXPreviewProps) {
  // Handle different content types
  const cleanContent = React.useMemo(() => {
    if (!content) return '';
    
    // If content is a string, clean it
    if (typeof content === 'string') {
      return content.replace(/^---[\s\S]*?---/, '').trim();
    }
    
    // If content is an object with default property (MDX module)
    if (content && typeof content === 'object' && 'default' in content) {
      return content.default;
    }
    
    // If content is already a React node, return as is
    return content;
  }, [content]);
  
  return (
    <MDXProvider>
      <MDXContent>{cleanContent}</MDXContent>
    </MDXProvider>
  );
} 