#!/bin/bash
# Автодеплой metallider_v2
# Запускается на сервере: bash deploy.sh

set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
export PATH="$HOME/.bun/bin:$PATH"

APP_DIR="/var/www/metallider_v2"
APP_NAME="metall-v2"

echo "=== Deploy started ==="

cd "$APP_DIR"

echo ">> git pull..."
git pull origin main

echo ">> npm install..."
npm install --legacy-peer-deps

echo ">> prisma generate..."
npx prisma generate

echo ">> npm run build..."
npm run build

echo ">> pm2 restart..."
pm2 restart "$APP_NAME"

echo "=== Deploy done ==="
