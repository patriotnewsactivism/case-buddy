#!/usr/bin/env bash
set -euo pipefail

if [ ! -d ".git" ]; then
  echo "Run this inside the root of your case-buddy git repo."
  exit 1
fi

BRANCH="feature/casebuddy-foundational-impl"
git checkout -b "$BRANCH" || git checkout "$BRANCH"

# Copy files from the unpacked changeset
BASE_DIR="$(dirname "$0")"
rsync -av "$BASE_DIR/case-buddy/" "./"

npm pkg set dependencies.react-router-dom='^6.24.0' >/dev/null 2>&1 || true

git add .
git commit -m "CaseBuddy: routing, auth+2FA mock, trial gating, doc analyzer with semantic search, basic case mgmt"
echo
echo "Committed on branch $BRANCH. Push and open a PR:"
echo "  git push --set-upstream origin $BRANCH"
