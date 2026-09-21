import { StatusBar, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { buildFinancialState } from '@emi-coach/financial-state';
import { NullNotificationIngestionAdapter } from '@emi-coach/provider-contracts';
import { getSqlCipherPlaceholder } from '@emi-coach/local-db';

/**
 * Phase 1 bootstrap screen. No EMI math, no loan UI.
 * Reads FinancialState placeholder only — does not import engine packages.
 */
export function BootstrapScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const state = buildFinancialState();
  const sqlcipher = getSqlCipherPlaceholder();

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Text style={styles.title}>EMI Coach</Text>
      <Text style={styles.body}>Phase 1 infrastructure bootstrap</Text>
      <Text style={styles.meta}>FinancialState ready: {String(state.ready)}</Text>
      <Text style={styles.meta}>SQLCipher: {sqlcipher.status}</Text>
      <Text style={styles.meta}>
        Android notification ingest: {NullNotificationIngestionAdapter.status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0B1F17',
  },
  title: {
    color: '#E8F5E9',
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
  },
  body: {
    color: '#A5D6A7',
    fontSize: 16,
    marginBottom: 24,
  },
  meta: {
    color: '#C8E6C9',
    fontSize: 14,
    marginBottom: 6,
  },
});
