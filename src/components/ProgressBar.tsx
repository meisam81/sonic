import React, { useRef } from 'react';
import { View, Text, PanResponder, StyleSheet, LayoutChangeEvent } from 'react-native';
import { formatDuration } from '../services/metadata-service';

interface ProgressBarProps {
  position: number;
  duration: number;
  isLoaded: boolean;
  onSeek: (positionMs: number) => void;
}

export function ProgressBar({ position, duration, isLoaded, onSeek }: ProgressBarProps) {
  const barWidth = useRef(0);
  const progress = duration > 0 ? position / duration : 0;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isLoaded,
      onMoveShouldSetPanResponder: () => isLoaded,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const pct = Math.max(0, Math.min(1, x / barWidth.current));
        onSeek(pct * duration);
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const pct = Math.max(0, Math.min(1, x / barWidth.current));
        onSeek(pct * duration);
      },
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    barWidth.current = e.nativeEvent.layout.width;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{formatDuration(position)}</Text>
      <View
        style={styles.track}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        <View style={styles.trackBg} />
        <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
        <View style={[styles.thumb, { left: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.time}>{formatDuration(duration)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  time: {
    fontSize: 12,
    color: '#888',
    fontVariant: ['tabular-nums'],
    width: 48,
    textAlign: 'center',
  },
  track: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
  },
  trackFill: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#7C7CFF',
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#7C7CFF',
    marginLeft: -7,
    top: 9,
  },
});
