import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { logger } from '../src/utils/logger';

export default function DiagnosticScreen() {
  const [logs, setLogs] = useState<string[]>(() => [...logger.getBuffer()]);
  const [renderError, setRenderError] = useState<string | null>(null);
  const mountTime = useRef(new Date().toISOString());

  useEffect(() => {
    logger.log(`DiagnosticScreen: useEffect ran at ${new Date().toISOString()}`);
    logger.log(`DiagnosticScreen: Mount time was ${mountTime.current}`);
    logger.log(`DiagnosticScreen: Platform = ${logger.platform()}`);
    return logger.subscribe(() => {
      setLogs([...logger.getBuffer()]);
    });
  }, []);

  // Wrap render in try/catch so we can display any render-time error
  try {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Text style={styles.title}>🎵 Sonic</Text>
          <Text style={styles.subtitle}>Diagnostic Build v0.1</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <Text style={styles.statusOk}>✅ App rendered successfully</Text>
            <Text style={styles.statusLine}>Platform: {logger.platform()}</Text>
            <Text style={styles.statusLine}>Mounted: {mountTime.current}</Text>
            <Text style={styles.statusLine}>Log entries: {logs.length}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Logs (newest first)</Text>
            <View style={styles.logBox}>
              {logs.length === 0 ? (
                <Text style={styles.logEmpty}>No log entries yet…</Text>
              ) : (
                [...logs].reverse().map((line, i) => (
                  <Text key={i} style={styles.logLine} numberOfLines={null}>
                    {line}
                  </Text>
                ))
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next step</Text>
            <Text style={styles.statusLine}>
              If you see this screen, the basic build is working.
            </Text>
            <Text style={styles.statusLine}>
              Logs also written to:{'\n'}
              /sdcard/Android/data/com.anonymous.sonic/files/sonic.log
            </Text>
            <Text style={styles.statusLine}>
              Screenshot this and send it back to me.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  } catch (e: any) {
    const msg = `RENDER ERROR\n${e?.message}\n${e?.stack}`;
    setRenderError(msg);
    logger.fatal('Render error', { message: e?.message, stack: e?.stack });
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{msg}</Text>
      </View>
    );
  }
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
  logEmpty: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  logLine: {
    fontSize: 10,
    color: '#AAA',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontFamily: 'monospace',
    padding: 12,
  },
});
