#!/usr/bin/env bash
# 「日出」博客发布脚本
# 用法: ./deploy.sh [commit 信息]
# 流程: 构建 → 静态产物同步到 tristesun.github.io(main) 并推送 → 源码备份到 source 分支
set -euo pipefail

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_DIR="$HOME/Documents/tristesun.github.io"
export GIT_SSH_COMMAND="ssh -o BatchMode=yes"

echo "▶ 构建 Hugo ..."
cd "$SRC_DIR"
hugo --cleanDestinationDir --gc --minify

echo "▶ 同步产物到部署仓库 ..."
rsync -a --delete --exclude '.git/' public/ "$DEPLOY_DIR/"

echo "▶ 推送 main 分支（线上页面）..."
cd "$DEPLOY_DIR"
if [[ -n "$(git status --porcelain)" ]]; then
  git add -A
  git commit -m "Site updated: ${1:-$(date '+%Y-%m-%d %H:%M:%S')}"
  git push origin main
else
  echo "  无变化，跳过"
fi

echo "▶ 备份源码到 source 分支 ..."
cd "$SRC_DIR"
git add -A
if [[ -n "$(git status --porcelain)" ]]; then
  git commit -m "Source updated: ${1:-$(date '+%Y-%m-%d %H:%M:%S')}"
fi
if git ls-remote --exit-code --heads origin source >/dev/null 2>&1; then
  git push origin source
else
  git push -u origin source
fi

echo "✔ 部署完成 https://tristesun.github.io/"
