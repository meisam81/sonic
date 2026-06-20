import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
  info: React.ErrorInfo | null;
}

/**
 * Catches JS errors anywhere in the child tree and displays them on screen.
 * This is a debugging aid — once the app is stable, we can render children
 * only and log errors to a remote service.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    this.setState({ error, info });
  }

  reset = () => {
    this.setState({ error: null, info: null });
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>Sonic crashed</Text>
            <Text style={styles.subtitle}>An error occurred. Please share the details below.</Text>
          </View>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.label}>Error</Text>
            <Text style={styles.errorText}>{this.state.error.message}</Text>
            {this.state.error.stack && (
              <>
                <Text style={styles.label}>Stack</Text>
                <Text style={styles.stackText}>{this.state.error.stack}</Text>
              </>
            )}
            {this.state.info?.componentStack && (
              <>
                <Text style={styles.label}>Component stack</Text>
                <Text style={styles.stackText}>{this.state.info.componentStack}</Text>
              </>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={this.reset}>
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#EEE',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    marginBottom: 16,
  },
  scrollContent: {
    padding: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C7CFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontFamily: 'monospace',
  },
  stackText: {
    fontSize: 11,
    color: '#AAA',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#2D2D5E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#EEE',
    fontSize: 15,
    fontWeight: '500',
  },
});
