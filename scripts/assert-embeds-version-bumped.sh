#!/usr/bin/env bash
# Fails when files under packages/embeds/js or packages/embeds/react changed
# without bumping both package versions to the same value: they are published
# in lockstep since @typebot.io/react bundles @typebot.io/js.
#
# Changed files are detected against the merge base with main (or
# VERSION_BUMP_BASE_REF), while versions must be strictly greater than the
# ones at the base ref tip so a bump that races another merged release is
# rejected too.
set -euo pipefail

base_ref="${VERSION_BUMP_BASE_REF:-$(git rev-parse --verify -q origin/main >/dev/null && echo origin/main || echo main)}"
merge_base=$(git merge-base HEAD "$base_ref")

changed() {
  git diff --name-only "$merge_base" -- "$1" | grep -q .
}

bumped() {
  local base_version current_version
  base_version=$(git show "$base_ref:packages/embeds/$1/package.json" | extract_version)
  current_version=$(current_version_of "$1")
  node -e "
    const [base, current] = process.argv.slice(1).map((v) => v.split('.').map(Number));
    const isGreater = current[0] !== base[0] ? current[0] > base[0] : current[1] !== base[1] ? current[1] > base[1] : current[2] > base[2];
    process.exit(isGreater ? 0 : 1);
  " "$base_version" "$current_version"
}

current_version_of() {
  extract_version <"packages/embeds/$1/package.json"
}

extract_version() {
  node -e "let s='';process.stdin.on('data',(c)=>{s+=c}).on('end',()=>{console.log(JSON.parse(s).version)})"
}

require_bump() {
  if bumped "$1"; then
    echo "@typebot.io/$1: version bump detected"
  else
    echo "Embed sources changed but @typebot.io/$1 was not bumped above its version on $base_ref. Bump the versions in both packages/embeds/js and packages/embeds/react package.json files: they are published in lockstep since @typebot.io/react bundles @typebot.io/js."
    failed=1
  fi
}

failed=0
if changed packages/embeds/js || changed packages/embeds/react; then
  require_bump js
  require_bump react
  if [ "$(current_version_of js)" != "$(current_version_of react)" ]; then
    echo "@typebot.io/js ($(current_version_of js)) and @typebot.io/react ($(current_version_of react)) must be bumped to the same version: they are published in lockstep."
    failed=1
  fi
fi
exit $failed
