import { useQuery, useQueries } from '@tanstack/react-query';
import { renderToString } from 'react-dom/server';

async function getBookVersions(bookId: string): Promise<string[]> {
  if (!bookId) return [];
  
  try {
    // Try to dynamically import the directory
    const context = require.context('@site/docs', true, /\.mdx?$/);
    
    // Filter files for this book and extract versions
    const versions = context.keys()
      .filter(key => key.startsWith(`./${bookId}/`))
      .map(key => {
        const match = key.match(/v(\d+\.\d+\.\d+)\.mdx?$/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    if (versions.length === 0) {
      return [];
    }

    // Sort versions in descending order
    return versions.sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
      const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
      
      if (aMajor !== bMajor) return bMajor - aMajor;
      if (aMinor !== bMinor) return bMinor - aMinor;
      return bPatch - aPatch;
    });
  } catch (error) {
    console.error(`Error loading versions for ${bookId}:`, error);
    return [];
  }
}

export function useBookVersions(bookId: string) {
  return useQuery({
    queryKey: ['bookVersions', bookId],
    queryFn: () => getBookVersions(bookId),
    staleTime: Infinity,
  });
}

async function extractPreviewText(Component: React.ComponentType): Promise<string> {
  try {
    // Render the component to HTML string
    const html = renderToString(React.createElement(Component));
    
    // Convert HTML to plain text
    const text = html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, '') // Remove HTML entities
      .split('\n')
      .map(line => line.trim())
      .filter(line => 
        line && 
        !line.startsWith('import') && 
        !line.startsWith('export') &&
        !line.includes('{') &&
        !line.includes('}')
      )
      .join(' ')
      .trim();

    // Take first 300 characters
    return text.slice(0, 300) + '...';
  } catch (error) {
    console.error('Error extracting preview:', error);
    return '';
  }
}

export function useVersionContent(bookId: string, version?: string) {
  return useQuery({
    queryKey: ['bookContent', bookId, version],
    queryFn: async () => {
      if (!version) {
        throw new Error(`No version specified for ${bookId}`);
      }

      try {
        console.log(`Loading content for ${bookId} v${version}...`);
        
        const module = await import(`@site/docs/${bookId}/v${version}.mdx`);
        
        // Extract preview from the MDX content
        const preview = await extractPreviewText(module.default);
        
        console.log('Content loaded:', {
          hasContent: !!module.default,
          previewLength: preview.length,
          previewStart: preview.slice(0, 50)
        });

        return {
          version,
          title: module.frontMatter?.title || '',
          description: module.frontMatter?.description || '',
          date: module.frontMatter?.date || '',
          author: module.frontMatter?.author || '',
          image: module.frontMatter?.image || `/img/${bookId}Cover.png`,
          changes: module.frontMatter?.changes || [],
          content: module.default,
          rawContent: preview || module.frontMatter?.description || 'Preview not available'
        };

      } catch (error) {
        console.error('Error loading content:', error);
        throw error;
      }
    },
    enabled: !!version,
    retry: false
  });
}

export function useAllVersionContents(bookId: string, versions: string[]) {
  return useQueries({
    queries: versions.map(version => ({
      queryKey: ['bookContent', bookId, version],
      queryFn: async () => {
        const module = await import(`@site/docs/${bookId}/v${version}.mdx`);
        return {
          version,
          title: module.frontMatter?.title || '',
          description: module.frontMatter?.description || '',
          date: module.frontMatter?.date || '',
          author: module.frontMatter?.author || '',
          image: module.frontMatter?.image || `/img/${bookId}Cover.png`,
          changes: module.frontMatter?.changes || [],
          content: module.default
        };
      },
      staleTime: Infinity,
    })),
  });
} 