import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { AudioTrack } from '../types/audio';
import { formatDuration, formatFileSize } from '../services/metadata-service';

interface AudioListProps {
  tracks: AudioTrack[];
  currentTrackId?: string;
  isPlaying?: boolean;
  onTrackPress: (track: AudioTrack, index: number) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function AudioList({
  tracks,
  currentTrackId,
  isPlaying,
  onTrackPress,
  refreshing,
  onRefresh,
}: AudioListProps) {
  const renderItem = ({ item, index }: { item: AudioTrack; index: number }) => {
    const isCurrent = item.id === currentTrackId;

    return (
      <TouchableOpacity
        style={[styles.item, isCurrent && styles.itemActive]}
        onPress={() => onTrackPress(item, index)}
        activeOpacity={0.7}
      >
        <View style={styles.itemLeft}>
          <View style={[styles.artPlaceholder, isCurrent && styles.artPlaceholderActive]}>
            <Text style={styles.artIcon}>{isCurrent && isPlaying ? '▶' : '♪'}</Text>
          </View>
        </View>
        <View style={styles.itemCenter}>
          <Text style={[styles.title, isCurrent && styles.titleActive]} numberOfLines={1}>
            {item.title || item.filename}
          </Text>
          {item.artist ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {item.artist}{item.album ? ` • ${item.album}` : ''}
            </Text>
          ) : item.album ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {item.album}
            </Text>
          ) : null}
          <Text style={styles.meta}>
            {formatDuration(item.duration)}
            {item.size > 0 ? ` • ${formatFileSize(item.size)}` : ''}
          </Text>
        </View>
        <View style={styles.itemRight}>
          {isCurrent && isPlaying && <View style={styles.playingIndicator} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={tracks}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎵</Text>
          <Text style={styles.emptyTitle}>No audio files found</Text>
          <Text style={styles.emptySubtitle}>
            Pull to refresh or add music files to your device
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 80, // space for mini player
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1A1A1A',
  },
  itemActive: {
    backgroundColor: '#1A1A2E',
  },
  itemLeft: {
    marginRight: 12,
  },
  artPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artPlaceholderActive: {
    backgroundColor: '#2D2D5E',
  },
  artIcon: {
    fontSize: 20,
    color: '#666',
  },
  itemCenter: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#EEE',
    marginBottom: 2,
  },
  titleActive: {
    color: '#7C7CFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: '#666',
  },
  itemRight: {
    width: 24,
    alignItems: 'center',
  },
  playingIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#7C7CFF',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
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
