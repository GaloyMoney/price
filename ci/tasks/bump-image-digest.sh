#!/bin/bash

set -eu

export digest=$(cat ./edge-image/digest)
export history_digest=$(cat ./history-edge-image/digest)
export history_migrate_digest=$(cat ./history-migrate-edge-image/digest)
export ref=$(cat ./repo/.git/short_ref)

pushd charts-repo

yq -i e '.image.digest = strenv(digest)' ./charts/galoy/charts/price/values.yaml
yq -i e '.image.git_ref = strenv(ref)' ./charts/galoy/charts/price/values.yaml
yq -i e '.historyImage.digest = strenv(history_digest)' ./charts/galoy/charts/price/values.yaml
yq -i e '.historyMigrateImage.digest = strenv(history_migrate_digest)' ./charts/galoy/charts/price/values.yaml

if [[ -z $(git config --global user.email) ]]; then
  git config --global user.email "bot@galoy.io"
fi
if [[ -z $(git config --global user.name) ]]; then
  git config --global user.name "CI Bot"
fi

(
  cd $(git rev-parse --show-toplevel)
  git merge --no-edit ${BRANCH}
  git add -A
  git status
  git commit -m "chore(deps): bump galoy price image to '${digest}'"
)
