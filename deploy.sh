#!/bin/bash
# Автодеплой metallider_v2
# Запускается на сервере: bash deploy.sh

set -e

APP_DIR="/var/www/metallider_v2"
APP_NAME="metall-v2"

echo "=== Deploy started ==="

cd "$APP_DIR"

echo ">> git pull..."
git pull origin main

echo ">> npm install..."
npm install --production=false

echo ">> prisma generate..."
npx prisma generate

echo ">> npm run build..."
npm run build

echo ">> pm2 restart..."
pm2 restart "$APP_NAME"

echo "=== Deploy done ==="
