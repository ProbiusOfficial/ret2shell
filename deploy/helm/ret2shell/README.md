# Ret2Shell Helm Chart

This chart installs Ret2Shell into the fixed namespace `ret2shell-platform` and uses the fixed challenge namespace `ret2shell-challenge`.

Important constraints:

- Install with `-n ret2shell-platform --create-namespace`
- The release namespace must be `ret2shell-platform`
- The challenge namespace is always `ret2shell-challenge`
- The platform is deployed as a singleton workload and must not be scaled above one replica

RBAC defaults:

- The chart creates a platform `ServiceAccount`
- The chart creates a `ClusterRoleBinding`
- By default that binding targets the built-in `cluster-admin` role because Ret2Shell currently needs broad cluster control for challenge orchestration
- You can disable chart-managed RBAC and reuse a pre-created service account with:

```bash
--set platform.serviceAccount.create=false \
--set platform.serviceAccount.name=<existing-sa> \
--set platform.rbac.create=false
```

Quick start:

```bash
helm install ret2shell ./deploy/helm/ret2shell -n ret2shell-platform --create-namespace
```

Useful switches:

- `platform.exposure.type=ingress|nodePort`
- `postgresql.mode=internal|external`
- `valkey.mode=internal|external`
- `nats.mode=internal|external`
- `registry.mode=disabled|internal|external`
- `victoriaLogs.mode=disabled|internal|external`
- `platform.rbac.useClusterAdmin=true|false`

Example renders:

```bash
helm template ret2shell ./deploy/helm/ret2shell -n ret2shell-platform -f ./deploy/helm/ret2shell/examples/values-ingress-internal.yaml
helm template ret2shell ./deploy/helm/ret2shell -n ret2shell-platform -f ./deploy/helm/ret2shell/examples/values-nodeport-external.yaml
```

The chart defaults are templateable for validation, but you should replace at least these values before production use:

- `platform.image.*`
- `platform.config.auth.signingKey`
- `platform.config.server.externalDomain`
- all default passwords and tokens
- `registry.externalAccess.host` when internal registry is enabled

Current v1 registry behavior:

- Internal registry support is modeled as an anonymous registry plus a node-reachable external address
- If you need custom registry auth behavior, prefer switching `registry.mode=external` and supplying a preconfigured external registry
