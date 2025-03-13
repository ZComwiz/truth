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

export async function getBookVersions(bookId: string) {
  try {
    const bookDir = path.join('docs', bookId);
    const files = await fs.readdir(bookDir);
    return files
      .filter(file => file.match(/^v\d+\.\d+\.\d+\.md$/))
      .map(file => file.replace(/^v(.*?)\.md$/, '$1'));
  } catch (error) {
    console.error(`Error loading versions for ${bookId}:`, error);
    return [];
  }
} 