#!/usr/bin/env bash
# Run Unlighthouse against the production URL and fail CI if any category
# is below the budget defined in unlighthouse.config.ts.
set -e

SITE="${NEXT_PUBLIC_SITE_URL:-https://assiriktours.vercel.app}"
echo "Running Unlighthouse against $SITE"

# Use npx — pulls unlighthouse on the fly (dev-c in)
npx --yes unlighthouse-ci \
  --site "$SITE" \
  --budget-file ./unlighthouse.config.ts \
  --no-cache \
  --output-path reports/unlighthouse

echo "Report written to reports/unlighthouse/"
