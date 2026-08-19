#!/usr/bin/env bash

set -euo pipefail

worktree_root="${T3CODE_WORKTREE_PATH:-$(git rev-parse --show-toplevel)}"
source_root="${T3CODE_PROJECT_ROOT:-}"

if [[ -z "$source_root" ]]; then
  git_common_directory="$(git -C "$worktree_root" rev-parse --path-format=absolute --git-common-dir)"
  source_root="$(dirname "$git_common_directory")"
fi

if ! git -C "$source_root" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Could not resolve the source checkout at $source_root" >&2
  exit 1
fi

copy_private_file() {
  local relative_file="$1"
  local source_file="$source_root/$relative_file"
  local destination_file="$worktree_root/$relative_file"

  if [[ ! -f "$source_file" || "$source_file" == "$destination_file" ]]; then
    return
  fi

  mkdir -p "$(dirname "$destination_file")"
  install -m 600 "$source_file" "$destination_file"
  echo "Copied $relative_file"
}

copy_all_environment_files() {
  local relative_environment_file

  while IFS= read -r -d '' relative_environment_file; do
    if [[ "$relative_environment_file" == node_modules/* ]]; then
      continue
    fi

    copy_private_file "$relative_environment_file"
  done < <(
    git -C "$source_root" ls-files \
      --others \
      --ignored \
      --exclude-standard \
      -z \
      -- ':(glob)**/.env*'
  )
}

copy_local_agent_files() {
  local relative_agent_file
  local source_file
  local destination_file

  while IFS= read -r -d '' relative_agent_file; do
    destination_file="$worktree_root/$relative_agent_file"

    if [[ -e "$destination_file" || -L "$destination_file" ]]; then
      continue
    fi

    source_file="$source_root/$relative_agent_file"
    mkdir -p "$(dirname "$destination_file")"
    cp -Pp "$source_file" "$destination_file"
    echo "Copied $relative_agent_file"
  done < <(
    git -C "$source_root" ls-files \
      --others \
      --ignored \
      --exclude-standard \
      -z \
      -- .agents/skills .claude/skills
  )
}

copy_all_environment_files
copy_private_file "apps/viewer/src/test/.auth/user.json"
copy_private_file ".claude/settings.local.json"
copy_private_file ".vercel/project.json"
copy_local_agent_files

echo "Installing workspace dependencies..."
(
  cd "$worktree_root"
  bun install --frozen-lockfile
)

echo "Worktree setup complete."
