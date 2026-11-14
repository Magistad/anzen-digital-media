#!/usr/bin/env bash
# Install the Android SDK packages Closepath actually compiles with.
# Versions come from mobile/android/variables.gradle. The removed "tools"
# package is refused so a setup step cannot ask for it again.
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
file="$root/mobile/android/variables.gradle"

compile_sdk="$(sed -n "s/^[[:space:]]*compileSdkVersion[[:space:]]*=[[:space:]]*\\([0-9][0-9]*\\).*/\\1/p" "$file")"
build_tools="$(sed -n "s/^[[:space:]]*buildToolsVersion[[:space:]]*=[[:space:]]*'\\([^']*\\)'.*/\\1/p" "$file")"

if [ -z "$compile_sdk" ] || [ -z "$build_tools" ]; then
  echo "Could not read compileSdkVersion and buildToolsVersion from $file" >&2
  exit 1
fi

packages=(
  "platform-tools"
  "platforms;android-${compile_sdk}"
  "build-tools;${build_tools}"
)

for pkg in "${packages[@]}"; do
  name="${pkg%%;*}"
  if [ "$name" = "tools" ]; then
    echo "Refusing the removed Android SDK package 'tools'." >&2
    exit 1
  fi
done

echo "Installing Android SDK packages: ${packages[*]}"
sdkmanager --install "${packages[@]}"
