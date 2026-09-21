/**
 * TEST ONLY — development entry for Phase 1B native SQLCipher spike.
 * Rendered only when __DEV__ === true.
 */
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CompatibilitySpikeResult,
  runCompatibilitySpike,
} from './runCompatibilitySpike';

function formatGate(label: string, status: string): string {
  return `${label}: ${status}`;
}

export function DevSqlCipherSpikeEntry() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CompatibilitySpikeResult | null>(null);

  const onRun = useCallback(async () => {
    setRunning(true);
    try {
      const spikeResult = await runCompatibilitySpike();
      setResult(spikeResult);
    } finally {
      setRunning(false);
    }
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Phase 1B SQLCipher Spike</Text>
      <Text style={styles.warning}>TEST ONLY — native runtime gate</Text>
      <Text style={styles.body}>
        BUILD COMPATIBILITY is proven by CI assembleDebug. This screen proves
        RUNTIME ENCRYPTION, MIGRATION, and PERSISTENCE on a device or emulator.
      </Text>

      <Pressable
        accessibilityRole="button"
        disabled={running}
        onPress={onRun}
        style={[styles.button, running && styles.buttonDisabled]}
      >
        {running ? (
          <ActivityIndicator color="#0B1F17" />
        ) : (
          <Text style={styles.buttonLabel}>Run compatibility spike</Text>
        )}
      </Pressable>

      {result ? (
        <View style={styles.results}>
          <Text style={styles.resultLine}>
            {formatGate('RUNTIME ENCRYPTION', result.runtimeEncryption)}
          </Text>
          <Text style={styles.resultLine}>
            {formatGate('MIGRATION', result.migration)}
          </Text>
          <Text style={styles.resultLine}>
            {formatGate('PERSISTENCE', result.persistence)}
          </Text>
          <Text style={styles.meta}>
            wrong-key open: {result.wrongKeyOpenBehavior}
          </Text>
          <Text style={styles.meta}>
            wrong-key read: {result.wrongKeyAuthenticatedReadBehavior}
          </Text>
          <Text style={styles.meta}>
            isSQLCipher(): {String(result.sqlCipherNative)}
          </Text>
          {result.error ? (
            <Text style={styles.error}>error: {result.error}</Text>
          ) : null}
          {result.details.map((line) => (
            <Text key={line} style={styles.detail}>{line}</Text>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#0B1F17',
  },
  title: {
    color: '#E8F5E9',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  warning: {
    color: '#FFB74D',
    fontSize: 14,
    marginBottom: 12,
  },
  body: {
    color: '#A5D6A7',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#81C784',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    color: '#0B1F17',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    gap: 6,
  },
  resultLine: {
    color: '#E8F5E9',
    fontSize: 16,
    fontWeight: '500',
  },
  meta: {
    color: '#C8E6C9',
    fontSize: 13,
  },
  detail: {
    color: '#A5D6A7',
    fontSize: 12,
    marginTop: 2,
  },
  error: {
    color: '#EF9A9A',
    fontSize: 13,
    marginTop: 8,
  },
});
