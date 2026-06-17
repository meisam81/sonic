import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useMediaScanner } from '../../src/hooks/useMediaScanner';

export default function SettingsScreen() {
  const { tracks, rescan } = useMediaScanner();

  const totalDuration = tracks.reduce((sum, t) => sum + t.duration, 0);
  const totalSize = tracks.reduce((sum, t) => sum + t.size, 0);

  const formatTotalDuration = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatTotalSize = (bytes: number): string => {
    if (bytes === 0) return 'N/A';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Library stats */}
      <Text style={styles.sectionTitle}>Library</Text>
      <View style={styles.card}>
        <StatRow label="Total tracks" value={tracks.length.toString()} />
        <StatRow label="Total duration" value={formatTotalDuration(totalDuration)} />
        <StatRow label="Total size" value={formatTotalSize(totalSize)} />
        <StatRow
          label="Sources"
          value={`Media Store: ${tracks.filter((t) => t.source === 'media-store').length} • Files: ${tracks.filter((t) => t.source === 'filesystem').length}`}
        />
      </View>

      {/* Actions */}
      <Text style={styles.sectionTitle}>Actions</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.actionRow} onPress={rescan}>
          <Text style={styles.actionLabel}>Rescan Library</Text>
          <Text style={styles.actionHint}>Tap to refresh</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.card}>
        <StatRow label="App" value="Sonic" />
        <StatRow label="Version" value="1.0.0" />
        <StatRow label="Audio engine" value="expo-av" />
      </View>
    </ScrollView>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1A1A1A',
  },
  statLabel: {
    fontSize: 14,
    color: '#AAA',
  },
  statValue: {
    fontSize: 14,
    color: '#EEE',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionLabel: {
    fontSize: 14,
    color: '#7C7CFF',
  },
  actionHint: {
    fontSize: 12,
    color: '#666',
  },
});
