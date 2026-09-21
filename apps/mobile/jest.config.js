module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@emi-coach/financial-state$':
      '<rootDir>/../../packages/financial-state/src',
    '^@emi-coach/local-db$': '<rootDir>/../../packages/local-db/src',
    '^@emi-coach/provider-contracts$':
      '<rootDir>/../../packages/provider-contracts/src',
    '^@emi-coach/amortization-engine$':
      '<rootDir>/../../packages/amortization-engine/src',
    '^@emi-coach/transaction-engine$':
      '<rootDir>/../../packages/transaction-engine/src',
    '^@emi-coach/cashflow-engine$':
      '<rootDir>/../../packages/cashflow-engine/src',
    '^@emi-coach/debt-coach-engine$':
      '<rootDir>/../../packages/debt-coach-engine/src',
    '^@emi-coach/credit-engine$': '<rootDir>/../../packages/credit-engine/src',
    '^@emi-coach/types$': '<rootDir>/../../packages/types/src',
    '^@emi-coach/finance-core$': '<rootDir>/../../packages/finance-core/src',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@emi-coach)/)',
  ],
};
