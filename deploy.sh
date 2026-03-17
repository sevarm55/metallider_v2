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
git checkout -- bun.lock 2>/dev/null || true
git pull origin main

echo ">> bun install..."
bun install

echo ">> prisma generate..."
bunx prisma generate

echo ">> build..."
bun run build

echo ">> pm2 restart..."
pm2 restart "$APP_NAME"

echo "=== Deploy done ==="
