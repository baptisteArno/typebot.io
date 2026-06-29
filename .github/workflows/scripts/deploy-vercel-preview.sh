#!/usr/bin/env bash

branch_slug() {
  printf "%s" "$1" |
    tr "[:upper:]" "[:lower:]" |
    sed -E "s/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g" |
    cut -c 1-60
}

deploy_vercel_preview() {
  local app="$1"
  local project_id="$2"
  local project_name="$3"
  local alias_source="${PREVIEW_ALIAS_INPUT:-${PREVIEW_REF_INPUT:-${GITHUB_REF_NAME}}}"
  local slug
  local builder_host
  local viewer_host
  local deployment_url
  local deployment_json
  local alias_host

  slug="$(branch_slug "$alias_source")"

  if [ -z "$slug" ]; then
    echo "Could not derive a preview alias from '${alias_source}'" >&2
    exit 1
  fi

  builder_host="${BUILDER_PROJECT_NAME}-git-${slug}-typebot-io.vercel.app"
  viewer_host="${VIEWER_PROJECT_NAME}-git-${slug}-typebot-io.vercel.app"

  if [ "$app" = "builder" ]; then
    alias_host="$builder_host"
  else
    alias_host="$viewer_host"
  fi

  echo "Deploying ${app} preview for '${alias_source}'"
  echo "Builder URL: https://${builder_host}"
  echo "Viewer URL: https://${viewer_host}"

  export VERCEL_PROJECT_ID="$project_id"

  deployment_json="$(
    bunx "vercel@${VERCEL_CLI_VERSION:-54.18.2}" deploy \
      --yes \
      --force \
      --with-cache \
      --archive=tgz \
      --target=preview \
      --format=json \
      --token="$VERCEL_TOKEN" \
      --build-env="NEXTAUTH_URL=https://${builder_host}" \
      --env="NEXTAUTH_URL=https://${builder_host}" \
      --build-env="NEXT_PUBLIC_VIEWER_URL=https://${viewer_host}" \
      --env="NEXT_PUBLIC_VIEWER_URL=https://${viewer_host}" \
      --build-env="VERCEL_BUILDER_PROJECT_NAME=${BUILDER_PROJECT_NAME}" \
      --env="VERCEL_BUILDER_PROJECT_NAME=${BUILDER_PROJECT_NAME}" \
      --build-env="NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME=${VIEWER_PROJECT_NAME}" \
      --env="NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME=${VIEWER_PROJECT_NAME}" \
      --meta="manualPreviewAlias=${alias_source}" \
      --meta="manualPreviewApp=${app}"
  )"

  deployment_url="$(printf "%s" "$deployment_json" | jq -r ".url")"

  if [ -z "$deployment_url" ] || [ "$deployment_url" = "null" ]; then
    echo "Could not read deployment URL from Vercel response:" >&2
    printf "%s\n" "$deployment_json" >&2
    exit 1
  fi

  bunx "vercel@${VERCEL_CLI_VERSION:-54.18.2}" alias set "$deployment_url" "$alias_host" --token="$VERCEL_TOKEN"

  {
    echo "### ${app} preview"
    echo
    echo "- Deployment: ${deployment_url}"
    echo "- Alias: https://${alias_host}"
  } >>"$GITHUB_STEP_SUMMARY"
}
