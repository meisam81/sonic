export interface AudioTrack {
  id: string;
  uri: string;
  filename: string;
  title?: string;
  artist?: string;
  album?: string;
  duration: number; // milliseconds
  coverArt?: string; // local file URI or null
  size: number; // bytes
  lastModified: number; // epoch ms
  source: 'media-store' | 'filesystem';
}

export interface PlaybackState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  position: number; // milliseconds
  duration: number; // milliseconds
  rate: number; // 0.5 - 2.0
  isLoaded: boolean;
  isBuffering: boolean;
  error: string | null;
}

export type SortField = 'title' | 'artist' | 'album' | 'duration' | 'dateAdded';
export type SortDirection = 'asc' | 'desc';

export interface LibraryFilter {
  search: string;
  sortBy: SortField;
  sortDir: SortDirection;
}

export type PlaybackRate = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 1.75 | 2.0;

export const PLAYBACK_RATES: PlaybackRate[] = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
