#!/bin/bash
# .github/scripts/get-version.sh
# Usage: SERVICE_NAME=backend ./get-version.sh

set -e

if [ -z "$SERVICE_NAME" ]; then
  echo "SERVICE_NAME environment variable is required" >&2
  exit 1
fi

# Fetch latest tags
git fetch --tags

# Get latest tag for this service
LATEST_TAG=$(git tag -l "${SERVICE_NAME}-v*" | sort -V | tail -n1)
if [ -z "$LATEST_TAG" ]; then
  VERSION="0.0.0"
  TAG="${SERVICE_NAME}-v$VERSION"
  echo "No existing tags found, starting at $VERSION"
else
  # Extract version numbers
  VERSION="${LATEST_TAG#${SERVICE_NAME}-v}"
  TAG="$LATEST_TAG"
  echo "Latest tag found: $TAG"
fi

# Parse version into MAJOR.MINOR.PATCH
IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"

# Get last commit message
COMMIT_MSG=$(git log -1 --pretty=%B)
echo "Commit message: $COMMIT_MSG"

# Decide if bump is needed
if echo "$COMMIT_MSG" | grep -qiE '^feat!:|BREAKING CHANGE:'; then
  MAJOR=$((MAJOR + 1))
  MINOR=0
  PATCH=0
  NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
  TAG="${SERVICE_NAME}-v${NEW_VERSION}"
  echo "🚀 Breaking change, bumping MAJOR to $NEW_VERSION"
elif echo "$COMMIT_MSG" | grep -qiE '^feat:'; then
  MINOR=$((MINOR + 1))
  PATCH=0
  NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
  TAG="${SERVICE_NAME}-v${NEW_VERSION}"
  echo "✨ New feature, bumping MINOR to $NEW_VERSION"
elif echo "$COMMIT_MSG" | grep -qiE '^fix:'; then
  PATCH=$((PATCH + 1))
  NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
  TAG="${SERVICE_NAME}-v${NEW_VERSION}"
  echo "🐛 Bug fix, bumping PATCH to $NEW_VERSION"
else
  # No bump, keep latest tag
  NEW_VERSION="$VERSION"
  echo "No version bump, keeping tag $TAG"
fi

# Outputs for GitHub Actions
# Use ::set-output for legacy, or echo for new syntax
# For new syntax (recommended):
echo "version=$NEW_VERSION" >> "$GITHUB_OUTPUT"
echo "tag=$TAG" >> "$GITHUB_OUTPUT"
echo $TAG
