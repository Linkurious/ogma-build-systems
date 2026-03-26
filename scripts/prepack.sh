#!/bin/bash
set -e

TEMPLATES=(vite webpack rollup typescript node parcel)

for t in "${TEMPLATES[@]}"; do
  rm -rf "templates/$t/node_modules" "templates/$t/dist" "templates/$t/.parcel-cache"
  echo "Cleaned $t"
done
