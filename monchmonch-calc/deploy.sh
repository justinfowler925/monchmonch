#!/bin/bash
cd "$(dirname "$0")"
git init
git branch -m main
git add -A
git commit -m "MonchMonch interactive financial calculator"
gh repo create monchmonch-calc --public --source=. --push
echo ""
echo "✅ Done! Now go to https://vercel.com/new and import 'monchmonch-calc'"
