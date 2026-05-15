---
name: deploy-ret2shell-single-node
description: Deploy Ret2Shell (回归终端) CTF platform to a single remote Linux server via SSH using Docker Compose. Use when the user wants to install, set up, or deploy the ret2shell CTF challenge platform (from https://github.com/ret2shell/ret2shell) on a single remote server, VM, or cloud instance. Covers single-node Docker Compose deployment with optional k3s for dynamic container challenges. This is the single-node deployment path; for k8s multi-node cluster deployment, use the Helm chart directly instead. Also use when user mentions 回归终端, ret2shell, ret.sh.cn, or deploying a CTF platform on a single server.
---

# Deploy Ret2Shell CTF Platform — Single Node (Docker Compose)

> **Scope**: This skill covers single-node Docker Compose deployment only. For k8s multi-node cluster deployment, use the upstream Helm chart at `deploy/helm/ret2shell/` instead.

## CRITICAL: Ask Before Acting

**Before making ANY configuration decision, AskUserQuestion.** This skill involves many choices that affect how the platform runs. Do not assume defaults.

### Required Questions (ask all at once)

1. **Server connection**: What is the target server IP, SSH port, username, and SSH private key path?
2. **Deploy directory**: Where should ret2shell be deployed? (default: `/opt/ret2shell`; all data, source, and configs will live here)
3. **Platform access port**: Which port should Ret2Shell listen on? (e.g. 8083; check if 80/443/8080/5000/9428 are already used)
4. **Dynamic challenges**: Do you need k3s for dynamic container challenges? (costs ~500MB extra RAM; if no, platform serves static challenges only)
5. **k3s ingress options**: If installing k3s, it bundles Traefik which occupies ports 80/443. If these ports are already used by existing services (e.g. 1Panel, Nginx, gzCTF), k3s should be installed with `--disable traefik --disable servicelb` to avoid conflicts. Does the target server have services already listening on 80/443? (default: yes, disable them)
6. **Mirror acceleration**: Is the server in mainland China or unable to reach Docker Hub / crates.io smoothly? (if yes, enable China mirror acceleration)
7. **Domain / access method**: Will you use a domain name + HTTPS, or direct IP + HTTP port access?

### Optional Questions (ask if relevant)

8. **Registry port**: If 5000 is occupied, what port for the internal Docker registry? (default 5000)
9. **Logs port**: If 9428 is occupied, what port for VictoriaLogs? (default 9428)
10. **Secrets**: Use randomly generated DB password / signing key, or provide your own?

## Deployment Phases

### Phase 0: Server Survey (read-only)

SSH in and run discovery commands. **Do not modify anything yet.**

```bash
# Gather facts
docker --version
docker compose version
free -h
df -h
ss -tlnp | grep -E ':(80|443|8080|8081|8082|8083|5000|9428)'
cat /etc/os-release
```

Minimum requirements: **4GB RAM** (8GB+ with k3s), **40GB free disk**, Docker 20.10+.

Show the user what you found (ports in use, available RAM/disk) and confirm the deployment plan before Phase 1.

### Phase 1: Environment Setup

Only proceed after user approves the plan.

#### 1.1 Base directories

```bash
mkdir -p <DEPLOY_DIR>/{config,static}
```

#### 1.2 k3s (only if user chose "yes" for dynamic challenges)

Install via China mirror if user chose acceleration:

```bash
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | \
  INSTALL_K3S_MIRROR=cn \
  INSTALL_K3S_EXEC="server <K3S_DISABLE_FLAGS>" sh -
```

Otherwise standard install:

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="server <K3S_DISABLE_FLAGS>" sh -
```

Where `<K3S_DISABLE_FLAGS>` is:
- `--disable traefik --disable servicelb` (if user confirmed 80/443 are occupied)
- Empty string (if user wants k3s to manage 80/443)

Configure `/etc/rancher/k3s/registries.yaml` with Docker mirror (if acceleration enabled):

```yaml
mirrors:
  docker.io:
    endpoint:
      - "https://docker.m.daocloud.io"
      - "https://docker.mirrors.sjtug.sjtu.edu.cn"
  "<SERVER_IP>:<REGISTRY_PORT>":
    endpoint:
      - "http://<SERVER_IP>:<REGISTRY_PORT>"
configs:
  "<SERVER_IP>:<REGISTRY_PORT>":
    tls:
      insecure_skip_verify: true
```

Restart k3s: `systemctl restart k3s`

Extract kubeconfig (replace 127.0.0.1 with server IP):

```bash
cp /etc/rancher/k3s/k3s.yaml <DEPLOY_DIR>/config/kubeconfig.yaml
sed -i "s/127.0.0.1/<SERVER_IP>/g" <DEPLOY_DIR>/config/kubeconfig.yaml
chmod 644 <DEPLOY_DIR>/config/kubeconfig.yaml
```

If kube-system pods stuck in `ContainerCreating`, containerd likely cannot pull the pause image. Manually import it:

```bash
docker pull docker.m.daocloud.io/rancher/mirrored-pause:3.6
docker save docker.m.daocloud.io/rancher/mirrored-pause:3.6 | ctr -n k8s.io images import -
ctr -n k8s.io images tag docker.m.daocloud.io/rancher/mirrored-pause:3.6 rancher/mirrored-pause:3.6
```

#### 1.3 Docker mirror (only if acceleration enabled and Docker Hub unreachable)

```bash
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": ["https://docker.m.daocloud.io"]
}
EOF
systemctl restart docker
```

### Phase 2: Build Ret2Shell Image

```bash
git clone --depth=1 https://github.com/ret2shell/ret2shell.git <DEPLOY_DIR>/src
cd <DEPLOY_DIR>/src
```

#### 2.1 Inject mirrors (only if acceleration enabled)

Patch `Containerfile`:

```bash
sed -i 's|RUN apk add --update --no-cache musl-dev clang lld|RUN sed -i '"'"'s|dl-cdn.alpinelinux.org|mirrors.aliyun.com|g'"'"' /etc/apk/repositories \&\& apk add --update --no-cache musl-dev clang lld|' Containerfile
sed -i 's|RUN apk add --update --no-cache curl git skopeo tini|RUN sed -i '"'"'s|dl-cdn.alpinelinux.org|mirrors.aliyun.com|g'"'"' /etc/apk/repositories \&\& apk add --update --no-cache curl git skopeo tini|' Containerfile
```

Create `.cargo/config.toml`:

```toml
[registries.crates-io]
protocol = "sparse"
[source.crates-io]
replace-with = 'tuna'
[source.tuna]
registry = "sparse+https://mirrors.tuna.tsinghua.edu.cn/crates.io-index/"
```

#### 2.2 Build

```bash
./release-image.sh
```

**Expected build time**: 30–60 minutes (Rust release compilation). Build may be killed by OOM on <8GB RAM; if so, add a swapfile and retry.

### Phase 3: Configuration

Copy templates:

```bash
cp <DEPLOY_DIR>/src/deploy/compose/docker-compose.yml <DEPLOY_DIR>/
cp <DEPLOY_DIR>/src/deploy/compose/.env <DEPLOY_DIR>/
cp <DEPLOY_DIR>/src/deploy/compose/config/config.toml <DEPLOY_DIR>/config/
cp <DEPLOY_DIR>/src/deploy/compose/config/sensitive_word_list.txt <DEPLOY_DIR>/config/
```

#### 3.1 Fix known upstream incompatibilities

- **Postgres 18+**: volume mount must be `/var/lib/postgresql` (not `/var/lib/postgresql/data`)
- **Registry 3**: use the default entrypoint (do NOT override with a custom `command` as you would for registry:2; the upstream docker-compose template is outdated for v3)

#### 3.2 Generate secrets and configure

Generate random values (unless user provided their own):

```bash
SIGNING_KEY=$(openssl rand -hex 32)
DB_PASS=$(openssl rand -hex 16)
```

Update `config.toml`:
- `auth.signing_key` → `$SIGNING_KEY`
- `database.password` → `$DB_PASS`
- `server.external_domain` → `"<IP>:<PORT>"` or `"<DOMAIN>"`
- `server.external_https` → `false` if no HTTPS
- `cache.url` → `"redis://cache:6379"`
- `queue.host` → `"message_queue"`
- `cluster.enabled` → `true` (if k3s), else `false`
- `cluster.kube_config_path` → `"<DEPLOY_DIR>/config/kubeconfig.yaml"` (if k3s)
- `cluster.registry.external` → `"<IP>:<REGISTRY_PORT>"` (if k3s)
- `cluster.registry.server` → `"registry:<REGISTRY_PORT>"`
- `cluster.registry.insecure` → `true`

Update `.env`:
- `POSTGRES_PASSWORD` → same `$DB_PASS`

Update `docker-compose.yml`:
- platform port: `"<PLATFORM_PORT>:8080"`
- registry port: `"<REGISTRY_PORT>:5000"`
- vlogs port: `"<VLOGS_PORT>:9428"`

### Phase 4: Start Services

```bash
cd <DEPLOY_DIR>
docker compose up -d
```

Wait 15–30s, then verify:

```bash
curl -fsSL http://localhost:<PLATFORM_PORT>/api/ping   # expect "pong"
docker compose ps                                       # expect all Up/healthy
k3s kubectl get nodes                                   # expect Ready (if k3s)
```

### Phase 5: First Admin Registration

**Ret2Shell does NOT ship with a pre-created admin account.** The first user who registers through the web UI is automatically granted full admin permissions (Host, DevOps, Game, User, Statistics, etc.).

Direct the user to `http://<IP>:<PORT>` to register the first account.

## Quick Troubleshooting

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| `apk add` hangs | Alpine CDN slow | Inject `mirrors.aliyun.com` before `apk add` |
| `cargo build` takes 1h+ | crates.io slow | Add `.cargo/config.toml` with Tuna sparse index |
| Docker pull timeouts | Docker Hub blocked | Configure `docker.m.daocloud.io` mirror |
| Build killed (exit 137) | OOM during Rust compilation | Add swapfile or use a machine with 8GB+ RAM |
| Postgres keeps restarting | PG18 data dir changed | Mount to `/var/lib/postgresql` |
| Registry keeps restarting | Upstream template uses registry:2 command on registry:3 | Remove custom `command` from docker-compose, let default entrypoint handle it |
| k3s pods `ContainerCreating` | containerd cannot pull pause | Manual `docker pull` + `ctr import` of pause image |
| Platform cannot talk to k8s | kubeconfig has 127.0.0.1 | Replace with server public IP in copied kubeconfig |
