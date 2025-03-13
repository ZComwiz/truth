import React from 'react';
import { useLocation } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';

export default function RawContent() {
  const location = useLocation();
  const [_, bookId, version] = location.pathname.split('/');
  const content = usePluginData('raw-content-plugin');
  
  return (
    <pre>
      {content[bookId]?.[version] || ''}
    </pre>
  );
} 