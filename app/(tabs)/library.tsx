import React, { useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useMediaScanner } from '../../src/hooks/useMediaScanner';
import { useAudioPlayer } from '../../src/hooks/useAudioPlayer';
import { AudioList } from '../../src/components/AudioList';
import { AudioTrack, SortField } from '../../src/types/audio';
import { audioService } from '../../src/services/audio-service';
import { useRouter } from 'expo-router';

const SORT_OPTIONS: { label: string; value: SortField }[] = [
  { label: 'Title', value: 'title' },
  { label: 'Artist', value: 'artist' },
  { label: 'Album', value: 'album' },
  { label: 'Duration', value: 'duration' },
  { label: 'Date', value: 'dateAdded' },
];

export default function LibraryScreen() {
  const { filteredTracks, isScanning, filter, setFilter, rescan } = useMediaScanner();
  const player = useAudioPlayer();
  const router = useRouter();

  const handleTrackPress = useCallback(
    async (track: AudioTrack, index: number) => {
      audioService.setQueue(filteredTracks, index);
      await audioService.playTrack(track);
      router.push('/player');
    },
    [filteredTracks, router]
  );

  const toggleSortDir = () => {
    setFilter({ sortDir: filter.sortDir === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tracks, artists, albums..."
            placeholderTextColor="#666"
            value={filter.search}
            onChangeText={(text) => setFilter({ search: text })}
          />
          {filter.search.length > 0 && (
            <TouchableOpacity onPress={() => setFilter({ search: '' })}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort chips */}
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.sortChip,
              filter.sortBy === opt.value && styles.sortChipActive,
            ]}
            onPress={() => setFilter({ sortBy: opt.value })}
          >
            <Text
              style={[
                styles.sortChipText,
                filter.sortBy === opt.value && styles.sortChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.sortDirBtn} onPress={toggleSortDir}>
          <Text style={styles.sortDirText}>
            {filter.sortDir === 'asc' ? '↑' : '↓'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Track count */}
      <Text style={styles.count}>
        {filteredTracks.length} {filteredTracks.length === 1 ? 'track' : 'tracks'}
        {isScanning ? ' • Scanning...' : ''}
      </Text>

      {/* Track list */}
      <AudioList
        tracks={filteredTracks}
        currentTrackId={player.currentTrack?.id}
        isPlaying={player.isPlaying}
        onTrackPress={handleTrackPress}
        refreshing={isScanning}
        onRefresh={rescan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#EEE',
  },
  clearBtn: {
    fontSize: 16,
    color: '#888',
    paddingLeft: 8,
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    alignItems: 'center',
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  sortChipActive: {
    backgroundColor: '#2D2D5E',
  },
  sortChipText: {
    fontSize: 12,
    color: '#888',
  },
  sortChipTextActive: {
    color: '#7C7CFF',
    fontWeight: '500',
  },
  sortDirBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sortDirText: {
    fontSize: 14,
    color: '#CCC',
  },
  count: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
});
