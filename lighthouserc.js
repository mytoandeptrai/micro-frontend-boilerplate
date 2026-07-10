module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/tasks",
        "http://localhost:3000/stats",
      ],
      // Build + serve production output (not `pnpm dev`) — dev-server bundles are
      // unminified with HMR overhead, so their Lighthouse performance score is not
      // representative of what a real user gets.
      startServerCommand:
        "pnpm --filter @ops/shell --filter @ops/first-app --filter @ops/second-app build && " +
        "(pnpm --filter @ops/first-app preview &) && " +
        "(pnpm --filter @ops/second-app preview &) && " +
        "pnpm --filter @ops/shell preview",
      startServerReadyPattern: "Local:",
      startServerReadyTimeout: 60000,
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
}
