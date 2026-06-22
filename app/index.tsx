import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';

export default function DiagnosticScreen() {
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toISOString()}] [INFO] DiagnosticScreen: constructor called`,
  ]);
  const [step, setStep] = useState('init');

  useEffect(() => {
    const steps = [
      'useEffect started',
      `Platform: ${Platform.OS} ${Platform.Version}`,
      'React rendered successfully',
      'All core systems OK',
    ];

    steps.forEach((s, i) => {
      setTimeout(() => {
        const line = `[${new Date().toISOString()}] [INFO] ${s}`;
        setLogs((prev) => [...prev, line]);
        setStep(s);
      }, i * 300);
    });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>🎵 Sonic</Text>
        <Text style={styles.subtitle}>Diagnostic Build v0.2</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <Text style={styles.statusOk}>✅ App rendered successfully</Text>
          <Text style={styles.statusLine}>Platform: {Platform.OS} {Platform.Version}</Text>
          <Text style={styles.statusLine}>Current step: {step}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logs</Text>
          <View style={styles.logBox}>
            {logs.map((line, i) => (
              <Text key={i} style={styles.logLine} numberOfLines={null}>
                {line}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Info</Text>
          <Text style={styles.statusLine}>
            If you see this screen, the basic React Native + Expo Router build is working.
          </Text>
          <Text style={styles.statusLine}>
            Next: add scanner/player features back one at a time.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7C7CFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C7CFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statusOk: {
    fontSize: 14,
    color: '#5CD685',
    marginBottom: 4,
  },
  statusLine: {
    fontSize: 12,
    color: '#CCC',
    marginBottom: 4,
  },
  logBox: {
    backgroundColor: '#0A0A0A',
    borderRadius: 4,
    padding: 8,
    maxHeight: 400,
  },
  logLine: {
    fontSize: 10,
    color: '#AAA',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});