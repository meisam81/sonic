import MediaLibrary, { AssetField, MediaType, Query } from 'expo-media-library';
import { Paths } from 'expo-file-system';
import { Directory, File } from 'expo-file-system';
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
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
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
    }

    return tracks;
  } catch (err) {
    console.warn('Media store scan failed:', err);
    return [];
  }
}

async function scanDirectory(dir: Directory | string): Promise<AudioTrack[]> {
  try {
    let directory: Directory;
    if (typeof dir === 'string') {
      directory = new Directory(dir);
    } else {
      directory = dir;
    }

    const info = Paths.info(directory.uri);
    if (!info.exists) return [];

    const items = directory.list();
    const tracks: AudioTrack[] = [];

    for (const item of items) {
      if (item instanceof File) {
        if (isAudioFile(item.name)) {
          const fileInfo = item.info();
          tracks.push({
            id: generateId({
              uri: item.uri,
              filename: item.name,
              duration: 0,
              size: fileInfo.exists ? fileInfo.size ?? 0 : 0,
              lastModified: fileInfo.exists ? fileInfo.modificationTime ?? 0 : 0,
              source: 'filesystem',
            }),
            uri: item.uri,
            filename: item.name,
            title: item.name.replace(/\.[^.]+$/, ''),
            duration: 0,
            size: fileInfo.exists ? fileInfo.size ?? 0 : 0,
            lastModified: fileInfo.exists ? fileInfo.modificationTime ?? 0 : 0,
            source: 'filesystem',
          });
        }
      } else if (item instanceof Directory) {
        // Recurse one level
        try {
          const subItems = item.list();
          for (const subItem of subItems) {
            if (subItem instanceof File && isAudioFile(subItem.name)) {
              const subInfo = subItem.info();
              tracks.push({
                id: generateId({
                  uri: subItem.uri,
                  filename: subItem.name,
                  duration: 0,
                  size: subInfo.exists ? subInfo.size ?? 0 : 0,
                  lastModified: subInfo.exists ? subInfo.modificationTime ?? 0 : 0,
                  source: 'filesystem',
                }),
                uri: subItem.uri,
                filename: subItem.name,
                title: subItem.name.replace(/\.[^.]+$/, ''),
                duration: 0,
                size: subInfo.exists ? subInfo.size ?? 0 : 0,
                lastModified: subInfo.exists ? subInfo.modificationTime ?? 0 : 0,
                source: 'filesystem',
              });
            }
          }
        } catch {
          // skip unreadable subdirs
        }
      }
    }

    return tracks;
  } catch (err) {
    console.warn('Directory scan failed:', err);
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
  const [mediaStoreTracks, ...dirResults] = await Promise.all([
    scanMediaStore(),
    ...SCAN_DIRS.map(scanDirectory),
  ]);

  const allTracks = [mediaStoreTracks, ...dirResults].flat();
  return deduplicate(allTracks);
}

export async function scanSingleDirectory(dirUri: string): Promise<AudioTrack[]> {
  return scanDirectory(dirUri);
}