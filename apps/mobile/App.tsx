import { BootstrapScreen } from './src/screens/BootstrapScreen';

function App() {
  if (__DEV__) {
    const { DevSqlCipherSpikeEntry } =
      require('./src/dev/sqlcipher-spike/DevSqlCipherSpikeEntry') as typeof import('./src/dev/sqlcipher-spike/DevSqlCipherSpikeEntry');
    return <DevSqlCipherSpikeEntry />;
  }

  return <BootstrapScreen />;
}

export default App;
