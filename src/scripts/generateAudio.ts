import { AudioGenerator } from '../utils/audioGenerator.js';
import { getBookVersions, getVersionContent } from '../utils/bookContent';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

function extractChapters(content: string): { title: string; content: string }[] {
  // Split by H1 headers but keep the header with its content
  const chapters = content.split(/(?=^# )/m).filter(Boolean);
  
  return chapters.map(chapter => {
    const lines = chapter.trim().split('\n');
    const title = lines[0].replace(/^#\s+/, '').trim();
    const content = lines.join('\n').trim();
    return { title, content };
  });
}

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  const generator = new AudioGenerator({ apiKey, voiceId });

  // Force test with v1.0.0 of god-is-real
  const bookId = 'god-is-real';
  const version = '1.0.0';
  
  console.log(`Processing book: ${bookId} version: ${version}`);
  
  const content = await getVersionContent(version, bookId);
  if (!content?.content) {
    console.error('Could not find content');
    process.exit(1);
  }

  // Extract chapters
  const chapters = extractChapters(content.content).map((chapter, index) => ({
    ...chapter,
    path: path.join(bookId, `chapter-${index + 1}.md`),
    version,
    bookId,
    chapterNumber: index + 1
  }));

  console.log('\nFound chapters:');
  chapters.forEach(chapter => {
    console.log(`${chapter.chapterNumber}. ${chapter.title}`);
  });

  console.log('\nStarting audio generation...');
  await generator.generateBookAudio(chapters);
  console.log('Audio generation complete!');
}

main().catch(console.error);