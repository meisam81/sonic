import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AudioTrack } from '../types/audio';
import { formatDuration } from '../services/metadata-service';

interface MiniPlayerProps {
  track: AudioTrack | null;
  isPlaying: boolean;
  isLoaded: boolean;
  onPress: () => void;
  onTogglePlayPause: () => void;
}

export function MiniPlayer({
  track,
  isPlaying,
  isLoaded,
  onPress,
  onTogglePlayPause,
}: MiniPlayerProps) {
  if (!track || !isLoaded) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.info}>
        <View style={styles.artPlaceholder}>
          <Text style={styles.artIcon}>{isPlaying ? '▶' : '♪'}</Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.title} numberOfLines={1}>
            {track.title || track.filename}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {track.artist || formatDuration(track.duration)}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.playBtn} onPress={onTogglePlayPause}>
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#12121A',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1A1A1A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  artPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  artIcon: {
    fontSize: 16,
    color: '#666',
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EEE',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 1,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C7CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 18,
    color: '#FFF',
  },
});
