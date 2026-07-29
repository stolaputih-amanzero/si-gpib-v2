#!/usr/bin/env bash

# SI GPIB v2.2 Pre-Deployment Automated Check Runner
echo "========================================="
echo "🚀 Running SI GPIB v2.2 Pre-Deploy Checks"
echo "========================================="

npx tsx scripts/pre-deploy-check.ts

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "❌ Pre-deploy checks failed."
  exit 1
else
  echo "✅ Pre-deploy checks passed successfully."
  exit 0
fi
