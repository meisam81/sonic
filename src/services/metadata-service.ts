import * as MediaLibrary from 'expo-media-library';
import { AudioTrack } from '../types/audio';

/**
 * Enriches tracks with metadata from the media library.
 * For filesystem-only tracks, we rely on filename heuristics.
 */
export async function enrichMetadata(tracks: AudioTrack[]): Promise<AudioTrack[]> {
  // Try to get album/artist info from media library for media-store tracks
  const albumIds = new Set<string>();
  for (const t of tracks) {
    if (t.album) albumIds.add(t.album);
  }

  // Fetch album details
  const albumMap = new Map<string, { title: string; artist?: string }>();
  if (albumIds.size > 0) {
    try {
      const albums = await MediaLibrary.getAlbumsAsync();
      for (const album of albums) {
        albumMap.set(album.id, { title: album.title, artist: undefined });
      }
    } catch {
      // albums not available
    }
  }

  return tracks.map((t) => {
    const enriched = { ...t };

    // Apply album title from media library
    if (t.album && albumMap.has(t.album)) {
      enriched.album = albumMap.get(t.album)!.title;
    }

    // For filesystem tracks without metadata, parse filename
    if (!enriched.artist && !enriched.album && enriched.source === 'filesystem') {
      const parsed = parseFilename(enriched.filename);
      if (parsed.title) enriched.title = parsed.title;
      if (parsed.artist) enriched.artist = parsed.artist;
    }

    return enriched;
  });
}

/**
 * Try to extract artist/title from common filename patterns:
 * "Artist - Title.mp3", "Artist - Album - Title.mp3", etc.
 */
function parseFilename(filename: string): { title?: string; artist?: string } {
  const name = filename.replace(/\.[^.]+$/, '');

  // Pattern: "Artist - Title"
  const dashMatch = name.match(/^(.+?)\s*-\s*(.+)$/);
  if (dashMatch) {
    return { artist: dashMatch[1].trim(), title: dashMatch[2].trim() };
  }

  return { title: name };
}

/**
 * Format duration from milliseconds to mm:ss or h:mm:ss
 */
export function formatDuration(ms: number): string {
  if (ms <= 0) return '--:--';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
