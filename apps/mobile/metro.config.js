const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/**
 * Yarn 4 workspaces + node-modules linker.
 * Workspace packages live under packages/* and must be watchable by Metro.
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    disableHierarchicalLookup: true,
    extraNodeModules: {
      '@emi-coach/types': path.resolve(workspaceRoot, 'packages/types'),
      '@emi-coach/financial-state': path.resolve(
        workspaceRoot,
        'packages/financial-state',
      ),
      '@emi-coach/local-db': path.resolve(workspaceRoot, 'packages/local-db'),
      '@emi-coach/provider-contracts': path.resolve(
        workspaceRoot,
        'packages/provider-contracts',
      ),
      '@emi-coach/ui': path.resolve(workspaceRoot, 'packages/ui'),
      '@emi-coach/analytics': path.resolve(workspaceRoot, 'packages/analytics'),
      '@emi-coach/secure-storage': path.resolve(
        workspaceRoot,
        'packages/secure-storage',
      ),
      '@emi-coach/notifications': path.resolve(
        workspaceRoot,
        'packages/notifications',
      ),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
