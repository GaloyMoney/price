#!/bin/bash

set -eu

export digest=$(cat ./edge-image/digest)
export history_digest=$(cat ./history-edge-image/digest)
export history_migrate_digest=$(cat ./history-migrate-edge-image/digest)

pushd charts-repo

ref=$(yq e '.image.git_ref' charts/galoy/charts/price/values.yaml)
git checkout ${BRANCH}
old_ref=$(yq e '.image.git_ref' charts/galoy/charts/price/values.yaml)

cat <<EOF >> ../body.md
# Bump galoy price images

The galoy price image will be bumped to digest:
\`\`\`
${digest}
\`\`\`

The galoy price-history image will be bumped to digest:
\`\`\`
${history_digest}
\`\`\`

The galoy price-history-migrate image will be bumped to digest:
\`\`\`
${history_migrate_digest}
\`\`\`

Code diff contained in this image:

https://github.com/GaloyMoney/price/compare/${old_ref}...${ref}
EOF

export GH_TOKEN="$(ghtoken generate -b "${GH_APP_PRIVATE_KEY}" -i "${GH_APP_ID}" | jq -r '.token')"

gh pr close ${BOT_BRANCH} || true
gh pr create \
  --title "chore(deps): bump-price-image-${ref}" \
  --body-file ../body.md \
  --base ${BRANCH} \
  --head ${BOT_BRANCH} \
  --label galoybot \
  --label price
