#!/usr/bin/env bash
# Install Android SDK packages pinned by apps/mobile/android/build.gradle.
set -euo pipefail

SDK_ROOT="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
if [[ -z "$SDK_ROOT" ]]; then
  echo "ANDROID_HOME or ANDROID_SDK_ROOT must be set" >&2
  exit 1
fi

export PATH="$SDK_ROOT/cmdline-tools/latest/bin:$SDK_ROOT/platform-tools:$PATH"

install_platform_37() {
  if sdkmanager --list 2>/dev/null | grep -q 'platforms;android-37 '; then
    sdkmanager "platforms;android-37"
    return
  fi
  if sdkmanager --list 2>/dev/null | grep -q 'platforms;android-37.0'; then
    sdkmanager "platforms;android-37.0"
    if [[ ! -e "$SDK_ROOT/platforms/android-37" ]]; then
      ln -s "$SDK_ROOT/platforms/android-37.0" "$SDK_ROOT/platforms/android-37"
      echo "Linked platforms/android-37 -> android-37.0 (sdkmanager publishes 37.0 only)"
    fi
    return
  fi
  echo "Neither platforms;android-37 nor platforms;android-37.0 is available" >&2
  exit 1
}

sdkmanager \
  "platform-tools" \
  "build-tools;37.0.0" \
  "ndk;27.1.12297006"

install_platform_37

./scripts/ci-verify-android-sdk.sh
