#!/usr/bin/env bash
# Verify Android SDK components required by apps/mobile/android/build.gradle.
set -euo pipefail

SDK_ROOT="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
if [[ -z "$SDK_ROOT" ]]; then
  echo "ANDROID_HOME or ANDROID_SDK_ROOT must be set" >&2
  exit 1
fi

require_path() {
  local label="$1"
  local path="$2"
  if [[ ! -e "$path" ]]; then
    echo "Missing $label: $path" >&2
    exit 1
  fi
  echo "Found $label: $path"
}

require_path "platform android-37" "$SDK_ROOT/platforms/android-37"
require_path "build-tools 37.0.0" "$SDK_ROOT/build-tools/37.0.0"
require_path "NDK 27.1.12297006" "$SDK_ROOT/ndk/27.1.12297006"
require_path "platform-tools" "$SDK_ROOT/platform-tools"

echo "Android SDK components OK under $SDK_ROOT"
