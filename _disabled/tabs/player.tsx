import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAudioPlayer } from '../../src/hooks/useAudioPlayer';
import { audioService } from '../../src/services/audio-service';
import { PlayerControls } from '../../src/components/PlayerControls';
import { ProgressBar } from '../../src/components/ProgressBar';
import { formatDuration } from '../../src/services/metadata-service';

export default function PlayerScreen() {
  const player = useAudioPlayer();
  const { currentTrack, isPlaying, isLoaded, position, duration, rate, error } = player;
  const queueState = audioService.getQueue();
  const canSkipNext = queueState.index < queueState.tracks.length - 1;
  const canSkipPrevious = queueState.index > 0;

  if (!currentTrack) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>▶</Text>
        <Text style={styles.emptyTitle}>No track selected</Text>
        <Text style={styles.emptySubtitle}>Pick a track from your Library to start playing</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Album art / placeholder */}
      <View style={styles.artContainer}>
        <View style={styles.artPlaceholder}>
          <Text style={styles.artIcon}>♪</Text>
        </View>
      </View>

      {/* Track info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {currentTrack.title || currentTrack.filename}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentTrack.artist || 'Unknown Artist'}
        </Text>
        {currentTrack.album && (
          <Text style={styles.album} numberOfLines={1}>
            {currentTrack.album}
          </Text>
        )}
      </View>

      {/* Progress bar */}
      <ProgressBar
        position={position}
        duration={duration}
        isLoaded={isLoaded}
        onSeek={player.seekTo}
      />

      {/* Controls */}
      <PlayerControls
        isPlaying={isPlaying}
        isLoaded={isLoaded}
        rate={rate}
        canSkipNext={canSkipNext}
        canSkipPrevious={canSkipPrevious}
        onTogglePlayPause={player.togglePlayPause}
        onSkipNext={player.skipNext}
        onSkipPrevious={player.skipPrevious}
        onSkipForward={() => player.skipForward(10000)}
        onSkipBackward={() => player.skipBackward(10000)}
        onRateChange={player.setRate}
      />

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* File info */}
      <View style={styles.fileInfo}>
        <Text style={styles.fileInfoText}>
          {currentTrack.filename}
        </Text>
        <Text style={styles.fileInfoText}>
          {formatDuration(currentTrack.duration)} • {currentTrack.source === 'media-store' ? 'Media Store' : 'File System'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  content: {
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  artContainer: {
    marginBottom: 24,
  },
  artPlaceholder: {
    width: 240,
    height: 240,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artIcon: {
    fontSize: 64,
    color: '#333',
  },
  info: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EEE',
    textAlign: 'center',
    marginBottom: 4,
  },
  artist: {
    fontSize: 16,
    color: '#7C7CFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  album: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  errorBox: {
    marginTop: 16,
    marginHorizontal: 32,
    padding: 12,
    backgroundColor: '#2A1111',
    borderRadius: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center',
  },
  fileInfo: {
    marginTop: 24,
    alignItems: 'center',
  },
  fileInfoText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  empty: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    color: '#333',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#AAA',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
