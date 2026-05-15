#!/usr/bin/env bash
set -euo pipefail

# Ret2Shell Single-Node Deployment Script
# Usage:
#   Interactive:  ./deploy-ret2shell.sh
#   Auto (defaults): ./deploy-ret2shell.sh --auto

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

x1b=$(printf '\033')
RED="${x1b}[1;31m"
GREEN="${x1b}[1;32m"
YELLOW="${x1b}[1;33m"
BLUE="${x1b}[1;34m"
RESET="${x1b}[0m"

info()  { echo "${BLUE}[INFO]${RESET} $1"; }
ok()    { echo "${GREEN}[OK]${RESET} $1"; }
warn()  { echo "${YELLOW}[WARN]${RESET} $1"; }
err()   { echo "${RED}[ERR]${RESET} $1" >&2; }

# ── Defaults ──────────────────────────────────────────────────────────────────
AUTO=false
DEPLOY_DIR="/opt/ret2shell"
SERVER_IP=""
PLATFORM_PORT="8083"
REGISTRY_PORT="5000"
VLOGS_PORT="9428"
NEED_K3S=false
K3S_DISABLE_FLAGS="--disable traefik --disable servicelb"
USE_MIRROR=false
IMAGE_SOURCE=""
EXTERNAL_DOMAIN=""
USE_HTTPS=false
DB_PASS=""
SIGNING_KEY=""

# ── Parse args ────────────────────────────────────────────────────────────────
for arg in "$@"; do
    case "$arg" in
        --auto) AUTO=true ;;
    esac
done

# ── Prompt helper ─────────────────────────────────────────────────────────────
ask() {
    local prompt="$1" default="$2"
    if [[ "$AUTO" == true ]]; then
        echo "$default"
        return
    fi
    read -rp "$prompt [$default]: " ans
    echo "${ans:-$default}"
}

ask_yn() {
    local prompt="$1" default="$2"
    if [[ "$AUTO" == true ]]; then
        [[ "$default" == [Yy]* ]] && return 0 || return 1
    fi
    while true; do
        read -rp "$prompt [$default]: " ans
        ans="${ans:-$default}"
        case "$ans" in
            [Yy]*) return 0 ;;
            [Nn]*) return 1 ;;
        esac
    done
}

# ── Pre-flight checks ─────────────────────────────────────────────────────────
echo "========================================================================"
echo "  Ret2Shell Single-Node Deployment"
echo "========================================================================"
echo

info "Checking prerequisites..."

if ! command -v docker &>/dev/null; then
    err "Docker not found. Please install Docker first."
    exit 1
fi

if ! docker compose version &>/dev/null; then
    err "Docker Compose plugin not found. Please install it first."
    exit 1
fi

ok "Docker $(docker --version | awk '{print $3}' | tr -d ',') found"

RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
DISK_GB=$(df -BG . | awk 'NR==2{print $4}' | tr -d 'G')
info "RAM: ${RAM_MB}MB, Free disk: ${DISK_GB}GB"

if [[ "$RAM_MB" -lt 4096 ]]; then
    warn "RAM < 4GB. Ret2Shell may not run well."
fi

# ── Gather configuration ──────────────────────────────────────────────────────
echo
echo "--- Configuration ---"

# 1. Deploy directory
DEPLOY_DIR=$(ask "Deploy directory" "$DEPLOY_DIR")
DEPLOY_DIR="${DEPLOY_DIR%/}"
mkdir -p "$DEPLOY_DIR"

# 2. Server IP (auto-detect or ask)
AUTO_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7; exit}' || hostname -I | awk '{print $1}')
SERVER_IP=$(ask "Server public IP" "${AUTO_IP:-}")

# 3. Port planning
info "Checking port usage..."
ss -tlnp 2>/dev/null | grep -E ':(80|443|8080|8081|8082|8083|5000|9428)' || true

PLATFORM_PORT=$(ask "Platform port (Ret2Shell web UI)" "$PLATFORM_PORT")
REGISTRY_PORT=$(ask "Internal registry port" "$REGISTRY_PORT")
VLOGS_PORT=$(ask "VictoriaLogs port" "$VLOGS_PORT")

# 4. k3s
if ask_yn "Install k3s for dynamic container challenges? (~500MB extra RAM)" "N"; then
    NEED_K3S=true
    K3S_DISABLE_FLAGS=""
    if ask_yn "Disable Traefik & ServiceLB (recommended if 80/443 already in use)" "Y"; then
        K3S_DISABLE_FLAGS="--disable traefik --disable servicelb"
    fi
fi

# 5. Mirror acceleration
if curl -fsSL https://registry-1.docker.io/v2/ 2>/dev/null | grep -q 'Docker-Distribution-API-Version'; then
    info "Docker Hub is reachable."
    USE_MIRROR=false
else
    warn "Docker Hub seems unreachable."
    if ask_yn "Enable China mirror acceleration?" "N"; then
        USE_MIRROR=true
    fi
fi

# 6. Image source (auto-detect ghcr.io reachability)
if [[ -z "$IMAGE_SOURCE" ]]; then
    info "Checking ghcr.io reachability..."
    if docker pull ghcr.io/ret2shell/ret2shell:latest 2>/dev/null; then
        ok "ghcr.io is reachable."
        IMAGE_SOURCE="pull"
    else
        warn "ghcr.io unreachable or slow. Will build from source."
        IMAGE_SOURCE="build"
    fi
fi

if [[ "$IMAGE_SOURCE" == "pull" ]]; then
    if ! ask_yn "Use pre-built image from ghcr.io (fast)?" "Y"; then
        IMAGE_SOURCE="build"
    fi
fi

# 7. Domain / HTTPS
EXTERNAL_DOMAIN=$(ask "External domain or IP:PORT" "${SERVER_IP}:${PLATFORM_PORT}")
if ask_yn "Use HTTPS?" "N"; then
    USE_HTTPS=true
fi

# 8. Secrets
if ask_yn "Use randomly generated secrets?" "Y"; then
    SIGNING_KEY=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | xxd -p | tr -d '\n')
    DB_PASS=$(openssl rand -hex 16 2>/dev/null || head -c 32 /dev/urandom | xxd -p | tr -d '\n')
else
    read -rsp "Database password: " DB_PASS; echo
    read -rsp "Signing key (64 hex chars): " SIGNING_KEY; echo
fi

# ── Summary & confirm ─────────────────────────────────────────────────────────
echo
echo "========================================================================"
echo "  Deployment Summary"
echo "========================================================================"
echo "  Deploy dir:      $DEPLOY_DIR"
echo "  Server IP:       $SERVER_IP"
echo "  Platform port:   $PLATFORM_PORT"
echo "  Registry port:   $REGISTRY_PORT"
echo "  Logs port:       $VLOGS_PORT"
echo "  k3s:             $NEED_K3S"
[[ "$NEED_K3S" == true ]] && echo "  k3s flags:       $K3S_DISABLE_FLAGS"
echo "  Mirror accel:    $USE_MIRROR"
echo "  Image source:    $IMAGE_SOURCE"
echo "  External domain: $EXTERNAL_DOMAIN"
echo "  HTTPS:           $USE_HTTPS"
echo "========================================================================"

if ! ask_yn "Proceed with deployment?" "Y"; then
    info "Aborted."
    exit 0
fi

# ── Phase 1: Environment Setup ────────────────────────────────────────────────
info "Phase 1: Environment Setup"

mkdir -p "$DEPLOY_DIR"/{config,static}

# Docker mirror
if [[ "$USE_MIRROR" == true ]]; then
    info "Configuring Docker mirror..."
    if [[ -d /etc/docker ]]; then
        cat > /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": ["https://docker.m.daocloud.io"]
}
EOF
        systemctl restart docker 2>/dev/null || warn "Failed to restart docker; you may need to restart it manually."
    else
        warn "/etc/docker not found; please configure Docker mirror manually."
    fi
fi

# k3s
if [[ "$NEED_K3S" == true ]]; then
    info "Installing k3s..."
    if [[ "$USE_MIRROR" == true ]]; then
        curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | \
            INSTALL_K3S_MIRROR=cn \
            INSTALL_K3S_EXEC="server ${K3S_DISABLE_FLAGS}" sh -
    else
        curl -sfL https://get.k3s.io | \
            INSTALL_K3S_EXEC="server ${K3S_DISABLE_FLAGS}" sh -
    fi

    if [[ "$USE_MIRROR" == true ]]; then
        mkdir -p /etc/rancher/k3s
        cat > /etc/rancher/k3s/registries.yaml <<EOF
mirrors:
  docker.io:
    endpoint:
      - "https://docker.m.daocloud.io"
      - "https://docker.mirrors.sjtug.sjtu.edu.cn"
  "${SERVER_IP}:${REGISTRY_PORT}":
    endpoint:
      - "http://${SERVER_IP}:${REGISTRY_PORT}"
configs:
  "${SERVER_IP}:${REGISTRY_PORT}":
    tls:
      insecure_skip_verify: true
EOF
        systemctl restart k3s
    fi

    cp /etc/rancher/k3s/k3s.yaml "$DEPLOY_DIR/config/kubeconfig.yaml"
    sed -i "s/127.0.0.1/${SERVER_IP}/g" "$DEPLOY_DIR/config/kubeconfig.yaml"
    chmod 644 "$DEPLOY_DIR/config/kubeconfig.yaml"

    if [[ "$USE_MIRROR" == true ]]; then
        info "Importing pause image for k3s..."
        if docker pull docker.m.daocloud.io/rancher/mirrored-pause:3.6 2>/dev/null; then
            docker save docker.m.daocloud.io/rancher/mirrored-pause:3.6 | ctr -n k8s.io images import - 2>/dev/null || true
            ctr -n k8s.io images tag docker.m.daocloud.io/rancher/mirrored-pause:3.6 rancher/mirrored-pause:3.6 2>/dev/null || true
        fi
    fi

    ok "k3s installed"
fi

# ── Phase 2: Obtain Ret2Shell Image ───────────────────────────────────────────
info "Phase 2: Obtain Ret2Shell Image"

if [[ "$IMAGE_SOURCE" == "pull" ]]; then
    info "Pulling pre-built image from ghcr.io..."
    if docker pull ghcr.io/ret2shell/ret2shell:latest; then
        docker tag ghcr.io/ret2shell/ret2shell:latest ret2shell:latest
        ok "Image pulled"
    else
        warn "Failed to pull from ghcr.io, falling back to build from source..."
        IMAGE_SOURCE="build"
    fi
fi

if [[ "$IMAGE_SOURCE" == "build" ]]; then
    info "Building from source (this will take 30-60 minutes)..."

    # Retry clone up to 3 times
    for i in 1 2 3; do
        if git clone --depth=1 https://github.com/ret2shell/ret2shell.git "$DEPLOY_DIR/src"; then
            break
        fi
        warn "Clone attempt $i failed, retrying..."
        rm -rf "$DEPLOY_DIR/src"
        sleep 5
    done

    if [[ ! -d "$DEPLOY_DIR/src/.git" ]]; then
        err "Failed to clone ret2shell repository after 3 attempts."
        exit 1
    fi

    cd "$DEPLOY_DIR/src"

    if [[ "$USE_MIRROR" == true ]]; then
        info "Injecting mirror configurations..."
        sed -i 's|RUN apk add --update --no-cache musl-dev clang lld|RUN sed -i '"'"'s|dl-cdn.alpinelinux.org|mirrors.aliyun.com|g'"'"' /etc/apk/repositories \&\& apk add --update --no-cache musl-dev clang lld|' Containerfile
        sed -i 's|RUN apk add --update --no-cache curl git skopeo tini|RUN sed -i '"'"'s|dl-cdn.alpinelinux.org|mirrors.aliyun.com|g'"'"' /etc/apk/repositories \&\& apk add --update --no-cache curl git skopeo tini|' Containerfile

        mkdir -p .cargo
        cat > .cargo/config.toml <<'EOF'
[registries.crates-io]
protocol = "sparse"
[source.crates-io]
replace-with = 'tuna'
[source.tuna]
registry = "sparse+https://mirrors.tuna.tsinghua.edu.cn/crates.io-index/"
EOF
    fi

    ./release-image.sh
    ok "Image built"
fi

# ── Phase 3: Configuration ────────────────────────────────────────────────────
info "Phase 3: Configuration"

# Get templates (if not already present from build)
SRC_DIR="$DEPLOY_DIR/src"
if [[ "$IMAGE_SOURCE" == "pull" ]] || [[ ! -f "$SRC_DIR/deploy/compose/docker-compose.yml" ]]; then
    if [[ ! -d "$SRC_DIR/deploy/compose" ]]; then
        mkdir -p "$SRC_DIR/deploy/compose/config"
        info "Downloading compose templates..."
        for f in docker-compose.yml .env; do
            curl -sL --retry 3 -o "$SRC_DIR/deploy/compose/$f" \
                "https://raw.githubusercontent.com/ret2shell/ret2shell/main/deploy/compose/$f" || \
                { err "Failed to download $f"; exit 1; }
        done
        for f in config.toml sensitive_word_list.txt; do
            curl -sL --retry 3 -o "$SRC_DIR/deploy/compose/config/$f" \
                "https://raw.githubusercontent.com/ret2shell/ret2shell/main/deploy/compose/config/$f" || \
                { err "Failed to download $f"; exit 1; }
        done
    fi
fi

cp "$SRC_DIR/deploy/compose/docker-compose.yml" "$DEPLOY_DIR/"
cp "$SRC_DIR/deploy/compose/.env" "$DEPLOY_DIR/"
cp "$SRC_DIR/deploy/compose/config/config.toml" "$DEPLOY_DIR/config/"
cp "$SRC_DIR/deploy/compose/config/sensitive_word_list.txt" "$DEPLOY_DIR/config/"

# Fix known upstream incompatibilities
info "Fixing upstream incompatibilities..."

# Postgres 18: change mount path
sed -i 's|/var/lib/postgresql/data|/var/lib/postgresql|g' "$DEPLOY_DIR/docker-compose.yml"

# Registry 3: remove custom command (upstream uses registry:2 style)
sed -i '/registry:/,/^[a-z]/ { /command:/d }' "$DEPLOY_DIR/docker-compose.yml" || true

# Update docker-compose ports
sed -i "s|\"8080:8080\"|\"${PLATFORM_PORT}:8080\"|" "$DEPLOY_DIR/docker-compose.yml"
sed -i "s|\"5000:5000\"|\"${REGISTRY_PORT}:5000\"|" "$DEPLOY_DIR/docker-compose.yml"
sed -i "s|\"9428:9428\"|\"${VLOGS_PORT}:9428\"|" "$DEPLOY_DIR/docker-compose.yml"

# Remove nginx if 80 is occupied (common case)
if ss -tln 2>/dev/null | grep -q ':80\b'; then
    warn "Port 80 is occupied. Removing nginx service from docker-compose."
    python3 - "$DEPLOY_DIR/docker-compose.yml" <<'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f: content = f.read()
content = re.sub(r'  # nginx.*?(?=\n  # |\nvolumes:|\nnetworks:)', '', content, flags=re.DOTALL)
with open(path, 'w') as f: f.write(content)
PYEOF
fi

# Update .env
sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${DB_PASS}|" "$DEPLOY_DIR/.env"

# Update config.toml with section-aware replacement
info "Updating config.toml..."
python3 - "$DEPLOY_DIR/config/config.toml" "$SIGNING_KEY" "$DB_PASS" "$EXTERNAL_DOMAIN" "$USE_HTTPS" "$NEED_K3S" "$DEPLOY_DIR" "$SERVER_IP" "$REGISTRY_PORT" <<'PYEOF'
import sys, re

path, signing_key, db_pass, external_domain, use_https, need_k3s, deploy_dir, server_ip, registry_port = sys.argv[1:10]
use_https = use_https.lower() == 'true'
need_k3s = need_k3s.lower() == 'true'

with open(path) as f:
    content = f.read()

# [auth] section - signing_key
content = re.sub(
    r'(\[auth\][^\[]*?signing_key\s*=\s*)[^\n]*',
    r'\1"""' + signing_key + r'"""',
    content, flags=re.DOTALL)

# [database] section - password
content = re.sub(
    r'(\[database\][^\[]*?password\s*=\s*)[^\n]*',
    r'\1"""' + db_pass + r'"""',
    content, flags=re.DOTALL)

# [server] section - external_domain and external_https
content = re.sub(
    r'(\[server\][^\[]*?external_domain\s*=\s*)[^\n]*',
    r'\1"""' + external_domain + r'"""',
    content, flags=re.DOTALL)
content = re.sub(
    r'(\[server\][^\[]*?external_https\s*=\s*)[^\n]*',
    r'\1' + str(use_https).lower(),
    content, flags=re.DOTALL)

# [cache] section - url
content = re.sub(
    r'(\[cache\][^\[]*?url\s*=\s*)[^\n]*',
    r'\1"redis://cache:6379"',
    content, flags=re.DOTALL)

# [queue] section - host
content = re.sub(
    r'(\[queue\][^\[]*?host\s*=\s*)[^\n]*',
    r'\1"message_queue"',
    content, flags=re.DOTALL)

# [cluster] section - enabled and related configs
content = re.sub(
    r'(\[cluster\][^\[]*?enabled\s*=\s*)[^\n]*',
    r'\1' + str(need_k3s).lower(),
    content, flags=re.DOTALL)

if need_k3s:
    content = re.sub(
        r'(\[cluster\][^\[]*?kube_config_path\s*=\s*)[^\n]*',
        r'\1"""' + deploy_dir + r'/config/kubeconfig.yaml"""',
        content, flags=re.DOTALL)
    content = re.sub(
        r'(\[cluster\][^\[]*?external\s*=\s*)[^\n]*',
        r'\1"""' + server_ip + r':' + registry_port + r'"""',
        content, flags=re.DOTALL)
    content = re.sub(
        r'(\[cluster\][^\[]*?insecure\s*=\s*)[^\n]*',
        r'\1true',
        content, flags=re.DOTALL)

with open(path, 'w') as f:
    f.write(content)

print("config.toml updated")
PYEOF

ok "Configuration complete"

# ── Phase 4: Start Services ───────────────────────────────────────────────────
info "Phase 4: Start Services"

cd "$DEPLOY_DIR"
docker compose up -d

info "Waiting for services to start..."
sleep 15

# Verify
PING_RESULT=$(curl -fsSL "http://localhost:${PLATFORM_PORT}/api/ping" 2>/dev/null || true)
if [[ "$PING_RESULT" == "pong" ]]; then
    ok "Platform is responding!"
else
    warn "Platform not responding yet; checking container status..."
    docker compose ps
    info "Checking platform logs..."
    docker compose logs platform --tail 30
fi

if [[ "$NEED_K3S" == true ]]; then
    if k3s kubectl get nodes 2>/dev/null | grep -q Ready; then
        ok "k3s node is Ready"
    else
        warn "k3s node not ready yet; check with: k3s kubectl get nodes"
    fi
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo
echo "========================================================================"
echo "  ${GREEN}Deployment Complete${RESET}"
echo "========================================================================"
echo "  Web UI:    http://${SERVER_IP}:${PLATFORM_PORT}"
echo "  Deploy dir: $DEPLOY_DIR"
[[ "$NEED_K3S" == true ]] && echo "  k3s:       enabled"
echo
echo "  ${YELLOW}Important:${RESET} The first user to register becomes admin automatically."
echo "========================================================================"
