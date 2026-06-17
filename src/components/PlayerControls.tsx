import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PlaybackRate, PLAYBACK_RATES } from '../types/audio';

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoaded: boolean;
  rate: number;
  canSkipNext: boolean;
  canSkipPrevious: boolean;
  onTogglePlayPause: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onRateChange: (rate: PlaybackRate) => void;
}

export function PlayerControls({
  isPlaying,
  isLoaded,
  rate,
  canSkipNext,
  canSkipPrevious,
  onTogglePlayPause,
  onSkipNext,
  onSkipPrevious,
  onSkipForward,
  onSkipBackward,
  onRateChange,
}: PlayerControlsProps) {
  return (
    <View style={styles.container}>
      {/* Speed selector */}
      <View style={styles.speedRow}>
        {PLAYBACK_RATES.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.speedChip, r === rate && styles.speedChipActive]}
            onPress={() => onRateChange(r)}
          >
            <Text style={[styles.speedText, r === rate && styles.speedTextActive]}>
              {r}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onSkipPrevious}
          disabled={!canSkipPrevious}
        >
          <Text style={[styles.secondaryIcon, !canSkipPrevious && styles.disabled]}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onSkipBackward}>
          <Text style={styles.secondaryIcon}>⏪</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playBtn}
          onPress={onTogglePlayPause}
          disabled={!isLoaded}
        >
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onSkipForward}>
          <Text style={styles.secondaryIcon}>⏩</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onSkipNext}
          disabled={!canSkipNext}
        >
          <Text style={[styles.secondaryIcon, !canSkipNext && styles.disabled]}>⏭</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  speedChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  speedChipActive: {
    backgroundColor: '#7C7CFF',
  },
  speedText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  speedTextActive: {
    color: '#FFF',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  secondaryBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryIcon: {
    fontSize: 22,
    color: '#CCC',
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7C7CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 28,
    color: '#FFF',
  },
  disabled: {
    opacity: 0.3,
  },
});
