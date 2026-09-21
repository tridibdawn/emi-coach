#!/usr/bin/env bash
# Verify pinned Phase 1 toolchain versions in CI.
set -euo pipefail

NODE_VERSION="$(node -v)"
if [[ ! "$NODE_VERSION" =~ ^v22\.13 ]]; then
  echo "Expected Node 22.13.x, got $NODE_VERSION" >&2
  exit 1
fi

YARN_VERSION="$(yarn --version)"
if [[ "$YARN_VERSION" != "4.10.3" ]]; then
  echo "Expected Yarn 4.10.3, got $YARN_VERSION" >&2
  exit 1
fi

RN_VERSION="$(node -p "require('./apps/mobile/package.json').dependencies['react-native']")"
if [[ "$RN_VERSION" != "0.87.1" ]]; then
  echo "Expected react-native 0.87.1, got $RN_VERSION" >&2
  exit 1
fi

if [[ "${VERIFY_JDK:-}" == "true" ]]; then
  JAVA_VERSION="$(java -version 2>&1 | head -n1)"
  if [[ ! "$JAVA_VERSION" =~ \"17\. ]]; then
    echo "Expected JDK 17, got $JAVA_VERSION" >&2
    exit 1
  fi
fi

echo "Toolchain OK: Node $NODE_VERSION, Yarn $YARN_VERSION, react-native $RN_VERSION"
