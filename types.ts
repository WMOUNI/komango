
export enum MangaStatus {
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  HIATUS = 'Hiatus'
}

export enum MangaSource {
  OLYMPUS = 'Olympus',
  HIJALA = 'Hijala',
  AZORA = 'Azora',
  STARZ = 'Starz',
  WAVE = 'Wave'
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  releaseDate: string;
  source: MangaSource;
  pages: string[]; // URLs or base64
}

export interface UnifiedManga {
  id: string;
  title: string;
  nativeTitle?: string;
  author: string;
  description: string;
  coverImage: string;
  bannerImage?: string;
  status: MangaStatus;
  rating: number;
  genres: string[];
  lastUpdated: string;
  sources: MangaSource[];
  chapters: Chapter[];
  isFavorite?: boolean;
}

export type AppTab = 'home' | 'browse' | 'library' | 'history' | 'profile';
