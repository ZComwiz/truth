import fs from 'fs/promises';
import path from 'path';

export async function getVersionContent(version: string, bookId: string) {
  try {
    const filePath = path.join('docs', bookId, `v${version}.md`);
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      content,
      version,
      bookId
    };
  } catch (error) {
    console.error(`Error loading content for ${bookId} v${version}:`, error);
    return null;
  }
} 