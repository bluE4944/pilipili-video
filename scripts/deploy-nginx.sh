#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

DEPLOY_ROOT="${DEPLOY_ROOT:-/usr/share/nginx/pilipili-video}"
NGINX_CONF_SRC="${NGINX_CONF_SRC:-${PROJECT_ROOT}/scripts/nginx.conf}"
NGINX_CONF_TARGET="${NGINX_CONF_TARGET:-/etc/nginx/nginx.conf}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1/}"

if [ ! -f "${NGINX_CONF_SRC}" ]; then
  echo "缺少 nginx 配置文件: ${NGINX_CONF_SRC}" >&2
  exit 1
fi

if [ ! -f "${PROJECT_ROOT}/package.json" ]; then
  echo "项目目录不正确: ${PROJECT_ROOT}" >&2
  exit 1
fi

if [ -d "${PROJECT_ROOT}/.git" ]; then
  if ! command -v git >/dev/null 2>&1; then
    echo '检测到 Git 仓库，但系统中没有 git。' >&2
    exit 1
  fi

  if [ -n "$(git -C "${PROJECT_ROOT}" status --porcelain --untracked-files=no)" ]; then
    echo '检测到已跟踪文件存在未提交改动，已停止拉取最新代码以避免覆盖本地修改。' >&2
    echo '请先提交或处理本地改动，再重新执行部署脚本。' >&2
    exit 1
  fi
fi

if [ "$(id -u)" -eq 0 ]; then
  SUDO=''
else
  if ! command -v sudo >/dev/null 2>&1; then
    echo '当前不是 root，且系统中没有 sudo，无法部署到 nginx。' >&2
    exit 1
  fi
  SUDO='sudo'
fi

echo '==> 构建前端产物'
(
  cd "${PROJECT_ROOT}"
  if [ -d .git ]; then
    echo '==> 拉取最新代码'
    git pull --ff-only
  fi
  npm run build
)

if [ ! -d "${PROJECT_ROOT}/dist" ]; then
  echo "构建未生成 dist 目录: ${PROJECT_ROOT}/dist" >&2
  exit 1
fi

echo "==> 发布到 ${DEPLOY_ROOT}"
${SUDO} install -d -m 755 "${DEPLOY_ROOT}"

if command -v rsync >/dev/null 2>&1; then
  ${SUDO} rsync -a --delete "${PROJECT_ROOT}/dist/" "${DEPLOY_ROOT}/"
else
  echo '警告: 未找到 rsync，改用 cp 覆盖文件，旧文件可能残留。'
  ${SUDO} cp -r "${PROJECT_ROOT}/dist/." "${DEPLOY_ROOT}/"
fi

backup_suffix="$(date +%Y%m%d%H%M%S)"
if [ -f "${NGINX_CONF_TARGET}" ]; then
  echo "==> 备份 nginx 配置到 ${NGINX_CONF_TARGET}.bak-${backup_suffix}"
  ${SUDO} cp "${NGINX_CONF_TARGET}" "${NGINX_CONF_TARGET}.bak-${backup_suffix}"
fi

echo '==> 写入 nginx 配置'
${SUDO} cp "${NGINX_CONF_SRC}" "${NGINX_CONF_TARGET}"

echo '==> 校验并重启 nginx'
${SUDO} nginx -t
${SUDO} systemctl daemon-reload
${SUDO} systemctl enable --now nginx
${SUDO} systemctl restart nginx

echo "==> 检查 ${HEALTHCHECK_URL}"
if command -v curl >/dev/null 2>&1; then
  curl -I "${HEALTHCHECK_URL}"
fi

echo '==> 部署完成'
