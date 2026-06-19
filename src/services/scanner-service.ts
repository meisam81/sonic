import MediaLibrary, { AssetField, MediaType, Query } from 'expo-media-library';
import { Paths, Directory, File } from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import { AudioTrack } from '../types/audio';

const SCAN_DIRS = [
  '/storage/emulated/0/Music',
  '/storage/emulated/0/Download',
  '/storage/emulated/0/Audio',
  '/storage/emulated/0/Recordings',
];

const AUDIO_EXTENSIONS = new Set([
  '.mp3', '.flac', '.wav', '.aac', '.ogg', '.opus',
  '.m4a', '.wma', '.aiff', '.alac', '.dsf', '.dff',
]);

function isAudioFile(filename: string): boolean {
  const dot = filename.lastIndexOf('.');
  if (dot < 0) return false;
  const ext = filename.slice(dot).toLowerCase();
  return AUDIO_EXTENSIONS.has(ext);
}

function generateId(track: Omit<AudioTrack, 'id'>): string {
  return `${track.source}:${track.uri}:${track.size}:${track.lastModified}`;
}

async function scanMediaStore(): Promise<AudioTrack[]> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') return [];

    const assets = await new Query()
      .eq(AssetField.MEDIA_TYPE, MediaType.AUDIO)
      .limit(1000)
      .exe();

    const tracks: AudioTrack[] = [];
    for (const asset of assets) {
      try {
        const [filename, duration, uri, modificationTime] = await Promise.all([
          asset.getFilename(),
          asset.getDuration(),
          asset.getUri(),
          asset.getModificationTime(),
        ]);

        tracks.push({
          id: generateId({
            uri,
            filename,
            duration: (duration ?? 0) * 1000,
            size: 0,
            lastModified: modificationTime ?? 0,
            source: 'media-store',
          }),
          uri,
          filename,
          title: filename.replace(/\.[^.]+$/, ''),
          duration: (duration ?? 0) * 1000,
          size: 0,
          lastModified: modificationTime ?? 0,
          source: 'media-store',
        });
      } catch (assetErr) {
        // Skip individual asset failures
        continue;
      }
    }

    return tracks;
  } catch (err) {
    console.warn('Media store scan failed:', err);
    return [];
  }
}

/**
 * Get size + modificationTime for a file using legacy getInfoAsync.
 * The new SDK 56 File class doesn't expose these synchronously,
 * but legacy getInfoAsync still works.
 * Returns {exists, size, modificationTime} — all 0 if file doesn't exist.
 */
async function safeGetFileInfo(uri: string): Promise<{ size: number; modificationTime: number }> {
  try {
    const info = await LegacyFileSystem.getInfoAsync(uri, { size: true });
    if (info.exists && 'size' in info) {
      return {
        size: (info as any).size ?? 0,
        modificationTime: (info as any).modificationTime ?? 0,
      };
    }
  } catch {
    // fall through
  }
  return { size: 0, modificationTime: 0 };
}

async function scanOneDirectory(dirPath: string): Promise<AudioTrack[]> {
  try {
    // Paths.info only returns {exists, isDirectory} — use it for cheap existence check
    let exists = false;
    try {
      const pathInfo = Paths.info(`file://${dirPath}`);
      exists = pathInfo.exists;
    } catch {
      // Some paths can't be queried via Paths.info — try Directory constructor directly
      exists = true;
    }

    if (!exists) return [];

    let directory: Directory;
    try {
      directory = new Directory(dirPath);
    } catch {
      return [];
    }

    let items: (Directory | File)[];
    try {
      items = directory.list();
    } catch {
      return [];
    }

    const tracks: AudioTrack[] = [];
    for (const item of items) {
      try {
        if (item instanceof File && isAudioFile(item.name)) {
          const info = await safeGetFileInfo(item.uri);
          tracks.push({
            id: generateId({
              uri: item.uri,
              filename: item.name,
              duration: 0,
              size: info.size,
              lastModified: info.modificationTime,
              source: 'filesystem',
            }),
            uri: item.uri,
            filename: item.name,
            title: item.name.replace(/\.[^.]+$/, ''),
            duration: 0,
            size: info.size,
            lastModified: info.modificationTime,
            source: 'filesystem',
          });
        } else if (item instanceof Directory) {
          // Recurse one level into subdirectories
          try {
            const subItems = item.list();
            for (const subItem of subItems) {
              try {
                if (subItem instanceof File && isAudioFile(subItem.name)) {
                  const subInfo = await safeGetFileInfo(subItem.uri);
                  tracks.push({
                    id: generateId({
                      uri: subItem.uri,
                      filename: subItem.name,
                      duration: 0,
                      size: subInfo.size,
                      lastModified: subInfo.modificationTime,
                      source: 'filesystem',
                    }),
                    uri: subItem.uri,
                    filename: subItem.name,
                    title: subItem.name.replace(/\.[^.]+$/, ''),
                    duration: 0,
                    size: subInfo.size,
                    lastModified: subInfo.modificationTime,
                    source: 'filesystem',
                  });
                }
              } catch {
                // skip individual sub-item failures
              }
            }
          } catch {
            // skip unreadable subdirs
          }
        }
      } catch {
        // skip individual item failures
      }
    }

    return tracks;
  } catch (err) {
    console.warn(`Directory scan failed (${dirPath}):`, err);
    return [];
  }
}

function deduplicate(tracks: AudioTrack[]): AudioTrack[] {
  const seen = new Map<string, AudioTrack>();
  for (const t of tracks) {
    const key = `${t.filename}:${t.size}`;
    const existing = seen.get(key);
    if (!existing || t.source === 'media-store') {
      seen.set(key, t);
    }
  }
  return Array.from(seen.values());
}

export async function scanAllAudio(): Promise<AudioTrack[]> {
  // Run each directory scan independently — one bad path shouldn't kill the whole scan
  const dirResults = await Promise.all(SCAN_DIRS.map(scanOneDirectory));
  const mediaStoreTracks = await scanMediaStore();

  const allTracks = [mediaStoreTracks, ...dirResults].flat();
  return deduplicate(allTracks);
}

export async function scanSingleDirectory(dirUri: string): Promise<AudioTrack[]> {
  return scanOneDirectory(dirUri);
}
