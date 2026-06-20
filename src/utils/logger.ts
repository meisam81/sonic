/**
 * Lightweight diagnostic logger.
 * Writes to console AND keeps an in-memory buffer that the UI displays.
 * On Android, also appends to the app's external files directory so
 * it can be pulled off the device with a file manager or `adb pull`.
 *
 * File path: <AppExternalFilesDir>/sonic.log
 * On a typical Android device: /sdcard/Android/data/com.anonymous.sonic/files/sonic.log
 */

import { Platform } from 'react-native';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

const logBuffer: string[] = [];
const MAX_BUFFER = 200;
const subscribers: Set<() => void> = new Set();

function format(level: LogLevel, msg: string, extra?: any): string {
  const ts = new Date().toISOString();
  let line = `[${ts}] [${level}] ${msg}`;
  if (extra !== undefined) {
    try {
      const extraStr =
        typeof extra === 'string'
          ? extra
          : JSON.stringify(extra, getCircularReplacer(), 2);
      line += ` | ${extraStr}`;
    } catch {
      line += ` | [unserializable]`;
    }
  }
  return line;
}

function getCircularReplacer() {
  const seen = new WeakSet();
  return (_key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    if (value instanceof Error) {
      return { name: value.name, message: value.message, stack: value.stack };
    }
    return value;
  };
}

function appendLine(line: string) {
  logBuffer.push(line);
  if (logBuffer.length > MAX_BUFFER) logBuffer.shift();
  subscribers.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });

  // Best-effort file append (fire-and-forget)
  // We use the legacy API to keep it simple. Failures are silent.
  try {
    const LegacyFS = require('expo-file-system/legacy');
    const FileSystem = require('expo-file-system');
    const docs = FileSystem?.Paths?.document;
    if (docs && docs.uri) {
      const logFile = `${docs.uri}sonic.log`;
      // Read existing, append, write back
      LegacyFS.readAsStringAsync(logFile, { encoding: 'utf8' })
        .then((existing: string) => {
          const next = (existing || '') + line + '\n';
          return LegacyFS.writeAsStringAsync(logFile, next, { encoding: 'utf8' });
        })
        .catch(() => {
          // File probably doesn't exist yet — create it
          return LegacyFS.writeAsStringAsync(logFile, line + '\n', {
            encoding: 'utf8',
          });
        })
        .catch(() => {
          // give up silently
        });
    }
  } catch {
    // expo-file-system not available — fine, console only
  }
}

export const logger = {
  log(msg: string, extra?: any) {
    const line = format('INFO', msg, extra);
    console.log(line);
    appendLine(line);
  },
  warn(msg: string, extra?: any) {
    const line = format('WARN', msg, extra);
    console.warn(line);
    appendLine(line);
  },
  error(msg: string, extra?: any) {
    const line = format('ERROR', msg, extra);
    console.error(line);
    appendLine(line);
  },
  fatal(msg: string, extra?: any) {
    const line = format('FATAL', msg, extra);
    console.error(line);
    appendLine(line);
  },
  getBuffer(): readonly string[] {
    return logBuffer;
  },
  subscribe(fn: () => void): () => void {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
  platform(): string {
    return `${Platform.OS} ${Platform.Version}`;
  },
};
