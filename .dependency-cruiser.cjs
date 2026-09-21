/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'types-no-runtime-deps',
      comment: 'packages/types must not import other workspace packages or RN.',
      severity: 'error',
      from: { path: '^packages/types/src' },
      to: {
        path: '^(packages/(?!types)|apps/|react-native|react/)',
      },
    },
    {
      name: 'finance-core-types-only',
      severity: 'error',
      from: { path: '^packages/finance-core/src' },
      to: {
        path: '^packages/(?!types|finance-core)(/|$)',
      },
    },
    {
      name: 'engines-types-and-finance-core-only',
      severity: 'error',
      from: {
        path: '^packages/(amortization-engine|transaction-engine|cashflow-engine|debt-coach-engine|credit-engine)/src',
      },
      to: {
        path: '^packages/(?!types|finance-core|amortization-engine|transaction-engine|cashflow-engine|debt-coach-engine|credit-engine)(/|$)',
      },
    },
    {
      name: 'engines-no-react-native',
      severity: 'error',
      from: {
        path: '^packages/(types|finance-core|amortization-engine|transaction-engine|cashflow-engine|debt-coach-engine|credit-engine|financial-state)/src',
      },
      to: { path: '(^|/)(react-native|react/)(/|$)' },
    },
    {
      name: 'engines-no-network',
      severity: 'error',
      from: {
        path: '^packages/(types|finance-core|amortization-engine|transaction-engine|cashflow-engine|debt-coach-engine|credit-engine|financial-state)/src',
      },
      to: { path: '(^|/)(axios|node-fetch|undici)(/|$)' },
    },
    {
      name: 'engines-no-backend',
      severity: 'error',
      from: {
        path: '^packages/',
      },
      to: { path: '^backend/' },
    },
    {
      name: 'engines-no-llm',
      severity: 'error',
      from: {
        path: '^packages/',
      },
      to: { path: '(openai|anthropic|@google/generative-ai)' },
    },
    {
      name: 'financial-state-engines-and-types-only',
      severity: 'error',
      from: { path: '^packages/financial-state/src' },
      to: {
        path: '^packages/(?!types|finance-core|amortization-engine|transaction-engine|cashflow-engine|debt-coach-engine|credit-engine|financial-state)(/|$)',
      },
    },
    {
      name: 'local-db-types-only',
      severity: 'error',
      from: { path: '^packages/local-db/src' },
      to: {
        path: '^packages/(?!types|local-db)(/|$)',
      },
    },
    {
      name: 'provider-contracts-types-only',
      severity: 'error',
      from: { path: '^packages/provider-contracts/src' },
      to: {
        path: '^packages/(?!types|provider-contracts)(/|$)',
      },
    },
    {
      name: 'screens-must-not-import-engines',
      severity: 'error',
      from: { path: '^apps/mobile/src/screens' },
      to: {
        path: '^packages/(amortization-engine|transaction-engine|cashflow-engine|debt-coach-engine|credit-engine)(/|$)',
      },
    },
    {
      name: 'backend-must-not-import-ts-packages',
      severity: 'error',
      from: { path: '^backend/' },
      to: { path: '^packages/' },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.base.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      mainFields: ['main', 'types'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
