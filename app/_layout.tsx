import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { logger } from '../src/utils/logger';

export default function RootLayout() {
  useEffect(() => {
    logger.log(`RootLayout: mounted at ${new Date().toISOString()}`);
    logger.log(`RootLayout: Platform = ${logger.platform()}`);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F0F0F' },
        }}
      />
    </View>
  );
}
