import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useAudioPlayer } from '../src/hooks/useAudioPlayer';
import { MiniPlayer } from '../src/components/MiniPlayer';
import { useRouter, usePathname } from 'expo-router';

export default function RootLayout() {
  const player = useAudioPlayer();
  const router = useRouter();
  const pathname = usePathname();

  const isOnPlayerScreen = pathname === '/player';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F0F0F' },
          animation: 'slide_from_right',
        }}
      />
      {!isOnPlayerScreen && (
        <MiniPlayer
          track={player.currentTrack}
          isPlaying={player.isPlaying}
          isLoaded={player.isLoaded}
          onPress={() => router.push('/player')}
          onTogglePlayPause={player.togglePlayPause}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
});
