#!/bin/bash
set -e
set -x

rm -rf build
npm run build

cd build
git init
git checkout -b ghpages
echo "spookify.jarhar.com" > CNAME
git add .
git commit -m "github pages website"
git remote add origin git@github.com:josepharhar/spookify
git push -f origin ghpages

cd ..
#rm -rf build

