#!/usr/bin/env bash
# Fails when files under packages/embeds/js or packages/embeds/react changed
# (compared to the merge base with main, or VERSION_BUMP_BASE_REF) without
# bumping both package versions: they are published in lockstep since
# @typebot.io/react bundles @typebot.io/js.
set -euo pipefail

base_ref="${VERSION_BUMP_BASE_REF:-origin/main}"
base=$(git merge-base HEAD "$base_ref")

changed() {
  git diff --name-only "$base" -- "$1" | grep -q .
}

bumped() {
  local base_version current_version
  base_version=$(git show "$base:packages/embeds/$1/package.json" | extract_version)
  current_version=$(extract_version <"packages/embeds/$1/package.json")
  [ "$base_version" != "$current_version" ]
}

extract_version() {
  node -e "let s='';process.stdin.on('data',(c)=>{s+=c}).on('end',()=>{console.log(JSON.parse(s).version)})"
}

require_bump() {
  if bumped "$1"; then
    echo "@typebot.io/$1: version bump detected"
  else
    echo "Embed sources changed but @typebot.io/$1 was not bumped. Bump the versions in both packages/embeds/js and packages/embeds/react package.json files: they are published in lockstep since @typebot.io/react bundles @typebot.io/js."
    failed=1
  fi
}

failed=0
if changed packages/embeds/js || changed packages/embeds/react; then
  require_bump js
  require_bump react
fi
exit $failed
