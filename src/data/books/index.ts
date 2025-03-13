import { bookMetadata as godIsReal } from './god-is-real';

export interface Version {
  version: string;
  date: string;
  path: string;
  changes: string[];
}

export interface BookMetadata {
  id: string;
  title: string;
  description: string;
  author: string;
  coverImage: string;
  versions: Version[];
}

export const books: BookMetadata[] = [
  godIsReal,
  // Add more books here as they come
]; 