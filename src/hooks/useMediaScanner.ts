import { useState, useEffect, useCallback, useMemo } from 'react';
import { AudioTrack, LibraryFilter } from '../types/audio';
import { scanAllAudio } from '../services/scanner-service';
import { enrichMetadata } from '../services/metadata-service';

interface UseMediaScannerResult {
  tracks: AudioTrack[];
  filteredTracks: AudioTrack[];
  isScanning: boolean;
  error: string | null;
  filter: LibraryFilter;
  setFilter: (f: Partial<LibraryFilter>) => void;
  rescan: () => Promise<void>;
}

export function useMediaScanner(): UseMediaScannerResult {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilterState] = useState<LibraryFilter>({
    search: '',
    sortBy: 'title',
    sortDir: 'asc',
  });

  const scan = useCallback(async () => {
    setIsScanning(true);
    setError(null);
    try {
      const raw = await scanAllAudio();
      const enriched = await enrichMetadata(raw);
      setTracks(enriched);
    } catch (err: any) {
      console.warn('Scan failed:', err);
      setError(err?.message || 'Scan failed');
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    // Defer the scan until after the first paint so the UI shows
    // even if scanning throws or takes a while.
    const handle = setTimeout(() => {
      scan();
    }, 100);
    return () => clearTimeout(handle);
  }, [scan]);

  const setFilter = useCallback((partial: Partial<LibraryFilter>) => {
    setFilterState((prev) => ({ ...prev, ...partial }));
  }, []);

  const filteredTracks = useMemo(() => {
    let result = [...tracks];

    // Search
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.artist?.toLowerCase().includes(q) ||
          t.album?.toLowerCase().includes(q) ||
          t.filename.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const dir = filter.sortDir === 'asc' ? 1 : -1;
      switch (filter.sortBy) {
        case 'title':
          return dir * (a.title || a.filename).localeCompare(b.title || b.filename);
        case 'artist':
          return dir * (a.artist || '').localeCompare(b.artist || '');
        case 'album':
          return dir * (a.album || '').localeCompare(b.album || '');
        case 'duration':
          return dir * (a.duration - b.duration);
        case 'dateAdded':
          return dir * (a.lastModified - b.lastModified);
        default:
          return 0;
      }
    });

    return result;
  }, [tracks, filter]);

  return {
    tracks,
    filteredTracks,
    isScanning,
    error,
    filter,
    setFilter,
    rescan: scan,
  };
}
