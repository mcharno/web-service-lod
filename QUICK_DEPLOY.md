# Quick Deploy Reference - Linked Data Service

Quick reference for deploying and managing the linked-data-service on k3s.

## One-Time Setup

### 1. Apply RBAC Fix
```bash
# Apply simplified RBAC permissions (recommended for k3s homelab)
kubectl apply -f infra/k8s/argocd-rbac/clusterrole-simple.yaml
kubectl apply -f infra/k8s/argocd-rbac/clusterrolebinding.yaml

# Restart ArgoCD application controller to pick up new permissions
kubectl rollout restart deployment argocd-application-controller -n cicd

# Wait for restart to complete
kubectl rollout status deployment argocd-application-controller -n cicd

# Verify no forbidden errors
kubectl logs -n cicd -l app.kubernetes.io/name=argocd-application-controller --tail=50 | grep -i forbidden
```

### 2. Create Secrets
```bash
# GHCR pull secret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_GITHUB_PAT \
  -n web

# Geonames API secret
kubectl create secret generic linked-data-secrets \
  --from-literal=geonames_username=YOUR_GEONAMES_USERNAME \
  -n web
```

### 3. Deploy ArgoCD Application
```bash
kubectl apply -f infra/argocd/application.yaml
```

## Common Operations

### Check Status
```bash
# Application status
kubectl get application linked-data-service -n cicd

# Pods
kubectl get pods -n web -l app=linked-data-service

# All resources
kubectl get all -n web -l app=linked-data-service
```

### Trigger Manual Sync
```bash
kubectl patch application linked-data-service -n cicd \
  --type merge \
  --patch '{"operation": {"initiatedBy": {"username": "kubectl"}, "sync": {"revision": "HEAD"}}}'
```

### View Logs
```bash
# All pods
kubectl logs -n web -l app=linked-data-service --tail=50

# Follow logs
kubectl logs -n web -l app=linked-data-service -f
```

### Check Health
```bash
# Via kubectl
kubectl get pods -n web -l app=linked-data-service

# Via API
curl https://charno.net/health
```

### Restart Deployment
```bash
kubectl rollout restart deployment linked-data-service -n web
```

### Scale Replicas
```bash
# Scale to 3 replicas
kubectl scale deployment linked-data-service -n web --replicas=3

# Scale back to 2
kubectl scale deployment linked-data-service -n web --replicas=2
```

## Troubleshooting

### Check Application Sync Status
```bash
kubectl get application linked-data-service -n cicd -o jsonpath='{.status.sync.status}'
```

### Check Health Status
```bash
kubectl get application linked-data-service -n cicd -o jsonpath='{.status.health.status}'
```

### View Sync Errors
```bash
kubectl get application linked-data-service -n cicd -o jsonpath='{.status.operationState.message}'
```

### Describe Pod Issues
```bash
kubectl describe pods -n web -l app=linked-data-service
```

### Check Events
```bash
kubectl get events -n web --sort-by='.lastTimestamp'
```

## Update Secret

```bash
# Delete old secret
kubectl delete secret linked-data-secrets -n web

# Create new secret
kubectl create secret generic linked-data-secrets \
  --from-literal=geonames_username=NEW_USERNAME \
  -n web

# Restart deployment to pick up new secret
kubectl rollout restart deployment linked-data-service -n web
```

## Force Redeploy

```bash
# Delete the application (keeps resources)
kubectl delete application linked-data-service -n cicd

# Reapply
kubectl apply -f infra/argocd/application.yaml
```

## Access Service

```bash
# Via ingress
curl https://charno.net/health
curl https://charno.net/api/v1/docs

# Port-forward for local testing
kubectl port-forward -n web svc/linked-data-service 3000:3000
curl http://localhost:3000/health
```

## Useful Aliases

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# ArgoCD
alias kapp='kubectl get application -n cicd'
alias kappd='kubectl get application -n cicd -o yaml'

# Linked Data Service
alias klod='kubectl get all -n web -l app=linked-data-service'
alias klodp='kubectl get pods -n web -l app=linked-data-service'
alias klodl='kubectl logs -n web -l app=linked-data-service'
alias klodr='kubectl rollout restart deployment linked-data-service -n web'

# General
alias kw='kubectl get all -n web'
alias kwp='kubectl get pods -n web'
```
