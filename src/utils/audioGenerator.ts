import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

interface AudioGenerationConfig {
  apiKey: string;
  voiceId: string;
  modelId?: string;
  outputFormat?: string;
  stability?: number;
  similarityBoost?: number;
}

interface Chapter {
  title: string;
  content: string;
  path: string;
  version: string;
  bookId: string;
  chapterNumber: number;
}

interface ChapterMetadata {
  title: string;
  version: string;
  bookId: string;
  chapterNumber: number;
  contentHash: string;
  generated: string;
  duration: number;
  originalPosition: number;
}

export class AudioGenerator {
  private config: AudioGenerationConfig;
  private API_URL = 'https://api.elevenlabs.io/v1';
  private AUDIO_BASE_DIR = 'static/audio';

  constructor(config: AudioGenerationConfig) {
    this.config = {
      modelId: 'eleven_multilingual_v2',
      outputFormat: 'mp3_44100_128',
      stability: 0.5,
      similarityBoost: 0.5,
      ...config
    };
  }

  private getAudioPath(chapter: Chapter): string {
    return path.join(
      this.AUDIO_BASE_DIR,
      chapter.bookId,
      `v${chapter.version}`,
      `chapter-${chapter.chapterNumber.toString().padStart(3, '0')}.mp3`
    );
  }

  private normalizeContent(content: string): string {
    return content
      // Basic cleanup
      .trim()
      .replace(/\r\n/g, '\n')        // Windows line endings
      .replace(/\n\s*\n/g, '\n\n')   // Multiple blank lines
      .replace(/[ \t]+/g, ' ')       // Multiple spaces
      
      // Preserve semantic markdown (important for AI voice inflection)
      .replace(/\*\*\s*(.*?)\s*\*\*/g, '**$1**')  // Normalize but keep bold
      .replace(/__\s*(.*?)\s*__/g, '**$1**')      // Convert underscores to asterisks
      .replace(/\*\s*(.*?)\s*\*/g, '*$1*')        // Normalize but keep italic
      .replace(/_\s*(.*?)\s*_/g, '*$1*')          // Convert underscores to asterisks
      
      // Common copy-paste issues (non-semantic)
      .replace(/[\u2018\u2019]/g, "'")    // Smart quotes
      .replace(/[\u201C\u201D]/g, '"')    // Smart quotes
      .replace(/\u2026/g, '...')          // Ellipsis
      .replace(/\u2013|\u2014/g, '-')     // Em/En dashes
      .replace(/\u00A0/g, ' ')            // Non-breaking spaces
      .replace(/\u200B/g, '')             // Zero-width spaces
      .replace(/\uFEFF/g, '')             // BOM
      
      // Normalize headers while preserving level (semantic)
      .replace(/^(#{1,6})\s+/gm, '$1 ')   // Normalize header spacing
      
      // Final cleanup
      .replace(/ +$/gm, '')               // Trailing spaces
      .replace(/^ +/gm, '')               // Leading spaces
      .replace(/\n{3,}/g, '\n\n')         // Multiple line breaks
      .trim();                            // Final trim
  }

  private async getContentHash(content: string): Promise<string> {
    const normalizedContent = this.normalizeContent(content);
    
    // Log normalized content for debugging if needed
    if (process.env.NODE_ENV === 'development') {
      console.log('Normalized content:', normalizedContent);
    }
    
    return crypto
      .createHash('md5')
      .update(normalizedContent)
      .digest('hex');
  }

  private async saveMetadata(chapter: Chapter, audioPath: string, hash: string): Promise<void> {
    const metadataPath = audioPath.replace('.mp3', '.json');
    const metadata = {
      title: chapter.title,
      version: chapter.version,
      bookId: chapter.bookId,
      chapterNumber: chapter.chapterNumber,
      contentHash: hash,
      generated: new Date().toISOString(),
      duration: 0,
      originalPosition: chapter.chapterNumber,
    };

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private async shouldRegenerateAudio(chapter: Chapter, audioPath: string): Promise<boolean> {
    try {
      const metadataPath = audioPath.replace('.mp3', '.json');
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
      const currentHash = await this.getContentHash(chapter.content);
      
      return metadata.contentHash !== currentHash;
    } catch {
      return true;
    }
  }

  private async generateAudio(text: string, outputPath: string): Promise<void> {
    try {
      const response = await axios({
        method: 'POST',
        url: `${this.API_URL}/text-to-speech/${this.config.voiceId}`,
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.config.apiKey
        },
        data: {
          text,
          model_id: this.config.modelId,
          voice_settings: {
            stability: this.config.stability,
            similarity_boost: this.config.similarityBoost
          }
        },
        responseType: 'arraybuffer'
      });

      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      await fs.writeFile(outputPath, response.data);
      
      console.log(`Generated: ${outputPath}`);
    } catch (error) {
      console.error(`Error generating audio: ${error.message}`);
      throw error;
    }
  }

  private async findExistingChapterFile(chapter: Chapter): Promise<string | null> {
    const chapterDir = path.join(
      this.AUDIO_BASE_DIR,
      chapter.bookId,
      `v${chapter.version}`
    );

    try {
      const files = await fs.readdir(chapterDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const metadata = JSON.parse(
            await fs.readFile(path.join(chapterDir, file), 'utf-8')
          ) as ChapterMetadata;
          
          const currentHash = await this.getContentHash(chapter.content);
          if (metadata.contentHash === currentHash) {
            return file.replace('.json', '.mp3');
          }
        }
      }
    } catch {
      // Directory might not exist yet
    }
    return null;
  }

  private async handleChapterReorder(
    chapter: Chapter, 
    existingFile: string
  ): Promise<void> {
    const chapterDir = path.join(
      this.AUDIO_BASE_DIR,
      chapter.bookId,
      `v${chapter.version}`
    );
    
    const oldPath = path.join(chapterDir, existingFile);
    const newPath = this.getAudioPath(chapter);
    
    if (oldPath !== newPath) {
      console.log(`Chapter "${chapter.title}" moved from position ${existingFile.split('-')[0]} to ${chapter.chapterNumber}`);
      
      await fs.rename(oldPath, newPath);
      await fs.rename(
        oldPath.replace('.mp3', '.json'),
        newPath.replace('.mp3', '.json')
      );
      
      const metadata = JSON.parse(
        await fs.readFile(newPath.replace('.mp3', '.json'), 'utf-8')
      );
      metadata.chapterNumber = chapter.chapterNumber;
      await fs.writeFile(
        newPath.replace('.mp3', '.json'),
        JSON.stringify(metadata, null, 2)
      );
    }
  }

  async generateChapterAudio(chapter: Chapter): Promise<void> {
    const existingFile = await this.findExistingChapterFile(chapter);
    
    if (existingFile) {
      await this.handleChapterReorder(chapter, existingFile);
      console.log(`Reused existing audio for "${chapter.title}" (${chapter.chapterNumber})`);
      return;
    }

    const audioPath = this.getAudioPath(chapter);
    const contentHash = await this.getContentHash(chapter.content);

    console.log(`Generating new audio for "${chapter.title}" (${chapter.chapterNumber})`);
    await this.generateAudio(chapter.content, audioPath);
    await this.saveMetadata(chapter, audioPath, contentHash);
  }

  async generateBookAudio(chapters: Chapter[]): Promise<void> {
    const existingFiles = new Set<string>();
    const chapterDir = path.join(
      this.AUDIO_BASE_DIR,
      chapters[0].bookId,
      `v${chapters[0].version}`
    );

    try {
      const files = await fs.readdir(chapterDir);
      files.forEach(file => existingFiles.add(file));
    } catch {
      // Directory might not exist yet
    }

    for (const chapter of chapters) {
      await this.generateChapterAudio(chapter);
      
      const chapterBase = this.getAudioPath(chapter).split('/').pop();
      existingFiles.delete(chapterBase);
      existingFiles.delete(chapterBase.replace('.mp3', '.json'));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (existingFiles.size > 0) {
      console.log('\nCleaning up removed chapters:');
      for (const file of existingFiles) {
        const fullPath = path.join(chapterDir, file);
        console.log(`Removing ${file}`);
        await fs.unlink(fullPath);
      }
    }
  }
}

// Usage example:
/*
const generator = new AudioGenerator({
  apiKey: process.env.ELEVENLABS_API_KEY,
  voiceId: 'your-voice-id',
});

const chapters = [
  {
    title: 'Chapter 1',
    content: 'Chapter content...',
    path: 'docs/chapter-1.md',
    version: '1.0.0',
    bookId: 'book-id',
    chapterNumber: 1
  }
];

await generator.generateBookAudio(chapters);
*/ 