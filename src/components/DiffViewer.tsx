import React, { useState, useMemo } from 'react';
import styles from './DiffViewer.module.css';
import clsx from 'clsx';
import { useBookVersions, useVersionContent } from '@site/src/utils/contentLoader';

interface Version {
  version: string;
  date: string;
  content?: string;
  changes: string[];
}

interface DiffViewerProps {
  bookId: string;
}

interface DiffLine {
  type: 'addition' | 'deletion' | 'unchanged';
  content: string;
}

interface DiffSection {
  type: 'changes' | 'unchanged';
  lines: DiffLine[];
}

function extractContent(text: string | React.ReactNode | undefined | null): string {
  if (!text) return '';
  if (typeof text !== 'string') {
    console.warn('Expected string content but got:', typeof text);
    return '';
  }
  // Remove frontmatter before comparing
  return text
    .replace(/^---[\s\S]*?---/, '')
    .trim();
}

function computeDiff(oldText: string, newText: string): DiffSection[] {
  if (!oldText || !newText) {
    console.warn('Invalid input for diff comparison');
    return [];
  }

  // Improve content cleaning
  const cleanContent = (text: string) => {
    return text
      .replace(/^---[\s\S]*?---/, '') // Remove frontmatter
      .replace(/import.*$/gm, '') // Remove import statements
      .replace(/<AuthorHeader[\s\S]*?\/>/gm, '') // Remove AuthorHeader component
      .split('\n')
      .filter(line => line.trim()); // Remove empty lines more efficiently
  };

  const oldLines = cleanContent(oldText);
  const newLines = cleanContent(newText);

  const sections: DiffSection[] = [];
  let currentSection: DiffLine[] = [];
  let currentType: 'changes' | 'unchanged' = 'unchanged';

  for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine !== newLine) {
      if (currentType === 'unchanged' && currentSection.length > 0) {
        sections.push({ type: 'unchanged', lines: [...currentSection] });
        currentSection = [];
      }
      currentType = 'changes';
      
      if (oldLine) {
        currentSection.push({ type: 'deletion', content: oldLine });
      }
      if (newLine) {
        currentSection.push({ type: 'addition', content: newLine });
      }
    } else {
      if (currentType === 'changes' && currentSection.length > 0) {
        sections.push({ type: 'changes', lines: [...currentSection] });
        currentSection = [];
      }
      currentType = 'unchanged';
      if (oldLine) {
        currentSection.push({ type: 'unchanged', content: oldLine });
      }
    }
  }

  if (currentSection.length > 0) {
    sections.push({ type: currentType, lines: currentSection });
  }

  return sections;
}

export default function DiffViewer({ bookId }: DiffViewerProps): JSX.Element {
  const { data: versions = [] } = useBookVersions(bookId);
  const [selectedVersion, setSelectedVersion] = useState(versions[0] || '');
  const [compareVersion, setCompareVersion] = useState(versions[1] || '');
  
  const { data: currentContent } = useVersionContent(selectedVersion, bookId);
  const { data: compareContent } = useVersionContent(compareVersion, bookId);

  // Add this section to display changes
  const renderChangelog = () => {
    if (currentContent?.changes?.length) {
      return (
        <div className={styles.changelog}>
          <h3>Changes in version {selectedVersion}:</h3>
          <ul>
            {currentContent.changes.map((change, i) => (
              <li key={i}>{change}</li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.diffViewer}>
      {renderChangelog()}
      {/* ... rest of diff viewer JSX */}
    </div>
  );
}

export { DiffViewer };