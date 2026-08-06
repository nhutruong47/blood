# Blood Donation Platform — Operations Runbook
## Phiên bản: v1.0.0 | Ngày: 2026-07-27

---

## MỤC LỤC
1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Deployment Procedures](#2-deployment-procedures)
3. [Monitoring & Alerting](#3-monitoring--alerting)
4. [Backup & Recovery](#4-backup--recovery)
5. [Troubleshooting](#5-troubleshooting)
6. [Security Procedures](#6-security-procedures)
7. [Scaling](#7-scaling)
8. [Escalation](#8-escalation)

---

## 1. Tổng quan hệ thống

### 1.1 Architecture

```
Production Environment (Azure/AWS)
├── Load Balancer (HTTPS termination)
├── Backend Cluster (2x Spring Boot 3.5.3 / Java 21)
├── SQL Server 2022 (Primary + Read Replica)
├── Redis Cache (optional, for session management)
├── Prometheus + Grafana (monitoring)
└── Loki + Promtail (log aggregation)
```

### 1.2 Infrastructure URLs (Thay đổi theo môi trường)

| Service | URL | Port | Notes |
|---------|-----|------|-------|
| Backend API | `https://api.blood.example.com` | 443 | Production |
| Swagger UI | `https://api.blood.example.com/swagger-ui.html` | 443 | API docs |
| Grafana | `https://grafana.blood.example.com` | 443 | Monitoring |
| Prometheus | `https://prometheus.blood.example.com` | 443 | Metrics |
| Loki | `https://loki.blood.example.com` | 443 | Logs |

### 1.3 Health Endpoints

```
GET /actuator/health/liveness  → Kubernetes liveness probe
GET /actuator/health/readiness → Kubernetes readiness probe
GET /actuator/health          → Overall health status
GET /actuator/prometheus       → Prometheus metrics
GET /actuator/info             → Application info
```

### 1.4 Contact Information

| Role | Name | Phone | Email |
|------|------|-------|-------|
| On-call Engineer | TBD | TBD | oncall@blood.example.com |
| DBA | TBD | TBD | dba@blood.example.com |
| Security | TBD | TBD | security@blood.example.com |
| Product Owner | TBD | TBD | po@blood.example.com |

---

## 1.5 Database Login Model (Durable SQL User)

The application **never** connects to SQL Server as `sa`. It uses a dedicated,
least-privilege login `blood_app` whose password (`BLOOD_APP_PASSWORD`) is
distinct from the `sa` password (`DB_PASSWORD`). Provisioning happens
automatically on every cold start via the `init-db` one-shot compose service,
which runs [blood-backend/db/init/01-create-app-login.sql](../blood-backend/db/init/01-create-app-login.sql)
against the SQL container using `sqlcmd` and the `sa` password.

### Login matrix

| Login        | Password env var     | Used by                                            | Scope                                  |
|--------------|----------------------|----------------------------------------------------|----------------------------------------|
| `sa`         | `DB_PASSWORD`        | `init-db` service, `scripts/backup-db.sh`, `scripts/restore-db.sh`, operator sessions | SQL Server instance administrator (sysadmin) |
| `blood_app`  | `BLOOD_APP_PASSWORD` | `app` service (Spring Boot)                        | `db_owner` of the `BLOOD` database only |

### First-time setup

```bash
# 1. Copy the template and set two distinct strong passwords.
cp .env.example .env
# Edit .env and set DB_PASSWORD and BLOOD_APP_PASSWORD to different values.

# 2. Start the stack. The init-db service runs once before the app starts.
docker compose up -d

# 3. Confirm blood_app exists.
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "$DB_PASSWORD" -C -No \
    -Q "SELECT name FROM sys.server_principals WHERE name = 'blood_app'"
# Expected: one row, name = blood_app

# 4. Confirm the running app connects as blood_app (not sa).
docker compose logs app | grep -E 'HikariPool|blood-pool' | head
```

### Rotation procedure

`sa` and `blood_app` rotate independently.

```bash
# Rotate BLOOD_APP_PASSWORD (the one the app uses)
# 1. Update .env
sed -i 's/^BLOOD_APP_PASSWORD=.*/BLOOD_APP_PASSWORD=<new-strong-value>/' .env

# 2. Apply it to the running SQL Server (the init-db script is idempotent
#    and uses CREATE LOGIN WITH PASSWORD only when the login is absent, so
#    we must ALTER LOGIN directly here for rotation).
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "$DB_PASSWORD" -C -No \
    -Q "ALTER LOGIN blood_app WITH PASSWORD = N'<new-strong-value>'"

# 3. Restart the app so it picks up the new password from .env.
docker compose restart app
```

```bash
# Rotate DB_PASSWORD (the sa password)
# 1. Update .env
sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=<new-strong-value>/' .env

# 2. Recreate the sqlserver container so MSSQL_SA_PASSWORD takes effect on
#    cold start. The named volume `sqlserver-data` is preserved.
docker compose up -d --force-recreate sqlserver

# 3. Re-run init-db so it can authenticate as sa with the new password.
docker compose up init-db
```

### Out of scope (tracked for follow-up hardening)

- Replacing `db_owner` with a custom `db_app_role` that grants only the DDL
  subset Flyway actually needs.
- TLS / certificate pinning for SQL Server connections.
- Managed-SQL cutover (Azure SQL, AWS RDS) — the `blood_app` login shape is
  portable, but provider-specific cutover steps are not covered here.

---

## 2. Deployment Procedures

### 2.1 Pre-deployment Checklist

```bash
# 1. Verify all migrations are applied
docker compose exec app mvn flyway:migrate -X

# 2. Run smoke tests
mvn test -DskipIntegrationTests

# 3. Check database connectivity
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SA_PASSWORD" \
  -Q "SELECT GETDATE();"

# 4. Verify no critical security vulnerabilities
mvn dependency:tree | grep -E "SNAPSHOT|vulnerable"

# 5. Check disk space (min 5GB free)
df -h /

# 6. Verify environment variables are set
echo "JWT_SECRET length: ${#JWT_SECRET}"
echo "DB_PASSWORD set: $([ -n "$DB_PASSWORD" ] && echo YES || echo NO)"
```

### 2.2 Production Deployment (Docker Compose)

```bash
# 1. Pull latest images
git pull origin main

# 2. Set environment variables
export JWT_SECRET="<64-char-secret-from-KMS>"
export DB_PASSWORD="<from-Azure-KeyVault>"
export GRAFANA_ADMIN_PASSWORD="<strong-password>"
export CORS_ORIGINS="https://blood.example.com,https://admin.blood.example.com"

# 3. Run Flyway migrations
docker compose exec -T app mvn flyway:migrate

# 4. Deploy with zero-downtime (use --no-deps to avoid restarting DB)
docker compose up -d --no-deps app

# 5. Wait for health check
sleep 10
curl -sf https://api.blood.example.com/actuator/health || exit 1

# 6. Verify deployment
docker compose logs --tail=50 app | grep -E "Started BloodApplication|ERROR"
```

### 2.3 Kubernetes Deployment (Optional)

```yaml
# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl rollout status deployment/blood-api
kubectl exec -it deployment/blood-api -- curl localhost:8080/actuator/health
```

### 2.4 Rollback Procedure

```bash
# Docker Compose rollback
docker compose pull app:previous-tag
docker compose up -d --no-deps app

# Kubernetes rollback
kubectl rollout undo deployment/blood-api
kubectl rollout status deployment/blood-api

# Database rollback (if migration is the issue)
docker compose exec -T app mvn flyway:repair -X
# Then manually revert if needed:
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SA_PASSWORD" \
  -Q "ALTER TABLE tablename SET (SYSTEM_VERSIONING = OFF);" \
  -Q "DELETE FROM tablename WHERE condition;"
```

---

## 3. Monitoring & Alerting

### 3.1 Key Metrics to Watch

| Metric | Alert Threshold | Action |
|--------|---------------|--------|
| API Response Time (p95) | > 500ms | Check database queries, add indexes |
| API Error Rate | > 1% | Check logs, rollback if needed |
| Backend CPU Usage | > 80% for 5min | Scale horizontally |
| Backend Memory Usage | > 85% | Check for memory leaks, restart |
| HikariCP Active Connections | > 80% of max | Increase pool size |
| SQL Server CPU | > 70% | Check long-running queries |
| Disk Usage | > 85% | Archive old logs, scale storage |
| JWT Validation Failures | > 10/min | Check secret rotation |

### 3.2 Grafana Dashboards

**Dashboard 1: API Performance**
- Request rate by endpoint
- Response time percentiles (p50, p95, p99)
- Error rate by status code
- Active connections

**Dashboard 2: Database**
- Query execution time
- Connection pool usage
- Lock contention
- Cache hit ratio

**Dashboard 3: Business Metrics**
- Blood requests by urgency
- Donation registrations by day
- Blood unit inventory levels
- Active users by role

**Dashboard 4: System Health**
- JVM memory (heap/GC)
- Thread count
- File descriptor usage
- Container restart count

### 3.3 Alert Rules (Prometheus AlertManager)

```yaml
groups:
  - name: blood-api-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_server_requests_seconds_count{status=~"5.."}[5m]) > 0.01
        for: 2m
        annotations:
          summary: "High error rate on {{ $labels.instance }}"
          runbook: "Check application logs, verify database connectivity"

      - alert: SlowAPIResponse
        expr: histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m])) > 0.5
        for: 5m
        annotations:
          summary: "API p95 latency above 500ms"
          runbook: "Check slow query logs, database indexes"

      - alert: HikariCPExhausted
        expr: hikaricp_connections_active / hikaricp_connections_max > 0.9
        for: 1m
        annotations:
          summary: "HikariCP connection pool nearly exhausted"
          runbook: "Increase spring.datasource.hikari.maximum-pool-size"

      - alert: LowBloodStock
        expr: blood_unit_count_total{status="AVAILABLE"} < 10
        for: 0m
        annotations:
          summary: "Critical blood stock level"
          runbook: "Alert hospital coordinators, activate donor matching"
```

### 3.4 Log Aggregation Queries (Loki)

```bash
# Find all errors in the last hour
{app="blood-api"} |= "ERROR" | json | level="error"

# Find slow requests (> 1s)
{app="blood-api"} |= "request" | json | duration_ms > 1000

# Find JWT validation failures
{app="blood-api"} |= "JWT" | json | message=~".*invalid.*"

# Find all requests by user
{app="blood-api"} |= "userId=42" | json

# Trace a specific blood request
{app="blood-api"} |= "bloodRequestId=123" | json | line_format "{{.timestamp}} {{.message}}"
```

---

## 4. Backup & Recovery

### 4.1 Backup Schedule

| Type | Frequency | Retention | RPO |
|------|----------|----------|-----|
| Full Database Backup | Daily 02:00 UTC | 30 days | 24h |
| Transaction Log Backup | Every 15 min | 7 days | 15min |
| File System Backup | Weekly | 4 weeks | 24h |
| Application Logs | Daily | 90 days | 24h |
| Configuration Backup | On change | 12 months | On-change |

### 4.2 Backup Commands

Use the helper script `scripts/backup-db.sh` — it runs `sqlcmd` inside the
`blood-sqlserver` container, copies the resulting `.bak` file to
`./backups/BLOOD-<UTC timestamp>.bak` on the host, and cleans up the
in-container file. The host only needs `bash` and `docker`; no `sqlcmd`
install is required.

```bash
# Take a full backup (reads DB_PASSWORD from .env)
./scripts/backup-db.sh

# Custom output directory
BACKUP_DIR=/srv/backups ./scripts/backup-db.sh
```

For one-off `sqlcmd` invocations (e.g. integrity checks), use the canonical
path and the correct database name (`BLOOD`, not `blood_prod`):

```bash
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "$DB_PASSWORD" -C -No \
  -Q "RESTORE VERIFYONLY FROM DISK = N'/var/opt/mssql/backups/BLOOD-LATEST.bak'"
```

### 4.3 Recovery Procedures

Use `scripts/restore-db.sh <path-to-.bak>` for the standard restore path.
The script copies the backup into the container, drops the existing `BLOOD`
database (with `SINGLE_USER WITH ROLLBACK IMMEDIATE`), and runs
`RESTORE DATABASE BLOOD ... WITH RECOVERY`. After restore, restart the app
so Flyway re-validates the schema.

```bash
# 1. Take a defensive backup of the current state first
./scripts/backup-db.sh

# 2. Restore from the chosen .bak file
./scripts/restore-db.sh ./backups/BLOOD-20260806T091000Z.bak

# 3. Restart the app
docker compose restart app
curl -sf https://api.blood.example.com/actuator/health/liveness
```

For point-in-time recovery, stop the app, restore with `NORECOVERY`, then
bring the database online:

```bash
docker compose stop app

docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "$DB_PASSWORD" -C -No \
  -Q "RESTORE DATABASE [BLOOD] FROM DISK = N'/var/opt/mssql/backups/BLOOD-FULL.bak' WITH NORECOVERY"

docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "$DB_PASSWORD" -C -No \
  -Q "RESTORE LOG [BLOOD] FROM DISK = N'/var/opt/mssql/backups/BLOOD-LOG.trn' WITH RECOVERY, STOPATMARK = 'YYYY-MM-DD HH:MM:SS'"

docker compose up -d app
```

### 4.4 Disaster Recovery (RTO/RPO)

| Scenario | RTO | RPO | Procedure |
|---------|-----|-----|-----------|
| Single backend instance down | 5 min | 0 | Auto-restart via container orchestrator |
| Database corruption | 30 min | 15 min | Restore from backup, replay transaction logs |
| `sqlserver-data` volume lost | 15 min | last backup | `docker compose up -d --force-recreate sqlserver` recreates the container; the `init-db` service re-provisions `blood_app`; Flyway rebuilds the schema; `./scripts/restore-db.sh` repopulates the data from the latest `.bak`. Worst case = empty `BLOOD` (logged in `docker compose logs init-db`). |
| Full DC outage | 4 hours | 1 hour | Failover to secondary region |
| Ransomware | 24 hours | 15 min | Restore from offline backup |

The key durability invariant is: **the `blood_app` login is not stored in
the `sqlserver-data` volume**; it is recreated by the `init-db` one-shot
service on every cold start from
[blood-backend/db/init/01-create-app-login.sql](../blood-backend/db/init/01-create-app-login.sql).
This means a wiped volume does not break login provisioning — only the data,
which is recovered from `.bak` files written by `./scripts/backup-db.sh`.

---

## 5. Troubleshooting

### 5.1 High CPU Usage

```bash
# 1. Identify the process
docker stats --no-stream

# 2. Generate thread dump
docker compose exec app jstack $(docker compose exec app jps | grep BloodApplication | awk '{print $1}')

# 3. Generate heap dump (if memory leak suspected)
docker compose exec app jmap -dump:format=b,file=/tmp/heap.hprof $(docker compose exec app jps | grep BloodApplication | awk '{print $1}')

# 4. Check for infinite loops in logs
docker compose logs --since=10m app | grep -E "Thread\.sleep|Infinite loop|CPU spike"
```

### 5.2 Database Connection Issues

```bash
# 1. Check HikariCP pool
curl https://api.blood.example.com/actuator/metrics/hikaricp.connections.active

# 2. Check for deadlocks
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SA_PASSWORD" \
  -Q "EXEC sp_who2" | grep -E "blk|deadlock"

# 3. Check long-running queries
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SA_PASSWORD" \
  -Q "SELECT * FROM sys.dm_exec_requests WHERE status = 'running' AND session_id > 50"

# 4. Kill blocking sessions
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SA_PASSWORD" \
  -Q "KILL 52 -- replace 52 with session_id from step 3"
```

### 5.3 Authentication/Authorization Failures

```bash
# 1. Check JWT secret (must be same across all instances)
docker compose exec app env | grep JWT

# 2. Check for clock skew (JWT validation fails if servers are out of sync)
date; curl -s https://api.blood.example.com/actuator/info

# 3. Check token expiration
docker compose logs --since=5m app | grep -E "JWT expired|JWT invalid|401"

# 4. Force logout all users (rotate JWT secret)
# WARNING: This will log out all users immediately
docker compose exec app env | grep JWT_SECRET
# Rotate JWT_SECRET and restart all instances
```

### 5.4 Blood Unit Reservation Failures (Critical for Healthcare)

```bash
# 1. Check inventory levels
curl https://api.blood.example.com/api/inventory/stock | jq

# 2. Check reservation service logs
docker compose logs --since=10m app | grep -E "reserve|REJECTED|Not enough compatible"

# 3. Check for concurrent booking race conditions
docker compose logs --since=1h app | grep -E "OptimisticLock|HikariPool" | tail -20

# 4. Emergency: Manually approve a blood request if reservation is failing
# POST to /api/admin/emergency-approve
curl -X POST https://api.blood.example.com/api/admin/emergency-approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestId": 123, "overrideStock": true}'
```

### 5.5 Pod/Container Crash Loop

```bash
# 1. Check container logs
docker compose logs --tail=200 app

# 2. Check exit code
docker compose ps app

# 3. Check resource limits
docker stats --no-stream | grep app

# 4. Common causes and fixes:
# - OutOfMemoryError: Increase container memory limit
# - Flyway migration failure: Run migrations manually, check DB state
# - Missing environment variables: Verify .env file
# - Port conflict: Change HOST_PORT in docker-compose.yml
```

---

## 6. Security Procedures

### 6.1 Secret Rotation

```bash
# Rotate JWT secret (all users will be logged out)
# 1. Generate new secret (min 64 characters)
NEW_SECRET=$(openssl rand -base64 64)

# 2. Update in Azure Key Vault / environment
az keyvault secret set --vault-name blood-kv --name jwt-secret --value "$NEW_SECRET"

# 3. Restart all instances
docker compose up -d --no-deps app

# 4. Verify
curl -sf https://api.blood.example.com/actuator/health

# Rotate database password (quarterly)
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$OLD_PASSWORD" \
  -Q "ALTER LOGIN sa WITH PASSWORD = '$NEW_PASSWORD'"
```

### 6.2 TLS Certificate Renewal

```bash
# Let's Encrypt (renew 30 days before expiry)
certbot renew --webroot -w /var/www/html

# Manual renewal
# 1. Upload new certificate to Azure Key Vault / secrets manager
az keyvault certificate import --vault-name blood-kv --name tls-cert --file /path/to/cert.pem

# 2. Restart load balancer
# For nginx: nginx -s reload
# For Cloudflare: automatic
```

### 6.3 Security Incident Response

```bash
# 1. ISOLATE: Block suspicious IP
docker compose exec app iptables -A INPUT -s $SUSPICIOUS_IP -j DROP

# 2. INVESTIGATE: Check logs
docker compose logs --since=1h app | grep -E "$SUSPICIOUS_IP|unauthorized|injection|script>"

# 3. IDENTIFY: Check for data exfiltration
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$DB_PASSWORD" \
  -Q "SELECT * FROM logs WHERE ip = '$SUSPICIOUS_IP' ORDER BY created_at DESC"

# 4. NOTIFY: Security team + legal
# security@blood.example.com
# compliance@blood.example.com

# 5. REMEDIATE: Block IP at load balancer level
# Update firewall rules in Azure Portal

# 6. DOCUMENT: Create incident report
# See: docs/SECURITY_INCIDENT_TEMPLATE.md
```

### 6.4 Dependency Vulnerability Scanning

```bash
# Weekly: Run OWASP Dependency Check
mvn org.owasp:dependency-check-maven:check
# Report: target/dependency-check-report.html

# Monthly: Full CVE scan
docker run --rm -v $(pwd):/app aquasec/trivy:latest fs /app --severity HIGH,CRITICAL

# Block deployment if critical CVE found (CI/CD gate)
# In GitHub Actions:
- name: Security Scan
  run: |
    docker run --rm -v $(pwd):/app aquasec/trivy:latest fs /app --exit-code 1 --severity CRITICAL
```

---

## 7. Scaling

### 7.1 Horizontal Scaling (Backend)

```bash
# Add another backend instance
docker compose up -d --scale app=3

# Or with Kubernetes:
kubectl scale deployment blood-api --replicas=4

# Verify load balancing
watch -n 5 'curl -s https://api.blood.example.com/actuator/metrics/http.server.requests | jq .measurements'
```

### 7.2 Database Scaling

```sql
-- Read replica (for analytics queries)
-- Point read-only queries to replica
-- Connection string: blood-db-replica.database.windows.net

-- Connection pool tuning
-- Current: max=25, min-idle=10
-- For 4 backend instances: max=50, min-idle=20
UPDATE application_properties
SET value = '50'
WHERE name = 'spring.datasource.hikari.maximum-pool-size';
```

### 7.3 Cache Scaling

```bash
# Enable Redis for distributed session management (if needed)
# Currently using Caffeine (in-memory)
# For multi-instance: use Redis Spring Session
export SPRING_SESSION_STORE_TYPE=redis

# Redis connection
export SPRING_DATA_REDIS_HOST=redis.blood.example.com
export SPRING_DATA_REDIS_PASSWORD=<from-keyvault>
```

---

## 8. Escalation

### 8.1 Severity Levels

| Severity | Definition | Response Time | Examples |
|----------|-----------|--------------|----------|
| P1 CRITICAL | System down, data loss risk | 15 min | Database down, all APIs failing |
| P2 HIGH | Major feature broken | 1 hour | Blood reservation failing, auth broken |
| P3 MEDIUM | Feature degraded | 4 hours | Slow queries, email not sending |
| P4 LOW | Minor issue | 24 hours | UI glitch, cosmetic issue |

### 8.2 Escalation Path

```
P1: On-call Engineer → Team Lead → CTO → CEO (if > 30 min)
P2: On-call Engineer → Team Lead → Product Owner
P3: Team Lead → Developer (next business day)
P4: Backlog → Developer (next sprint)
```

### 8.3 Communication Templates

**P1 Incident (Template)**
```
[INCIDENT] P1 - Blood Donation Platform - <Short Description>

Status: INVESTIGATING
Impact: <What is affected>
Start Time: <HH:MM UTC>
Affected Users: <Number or estimate>

Current Status:
- [ ] Identified root cause
- [ ] Implementing fix
- [ ] Verifying fix
- [ ] Monitoring for 30 minutes

Next Update: <HH:MM UTC>
```

**Post-Incident Review (PIR)**
```
# PIR-<ID>: <Title>
Date: <Date>
Duration: <Duration>
Severity: P1/P2

## Summary

## Root Cause

## Impact

## What Went Well

## What Could Be Improved

## Action Items
- [ ] Action 1 (Owner, Due Date)
- [ ] Action 2 (Owner, Due Date)
```

---

## Appendix A: Useful Commands

```bash
# View all container logs
docker compose logs -f app

# View only errors
docker compose logs -f app | grep ERROR

# Check database migrations status
docker compose exec app mvn flyway:info

# Restart with fresh database (DANGER!)
docker compose down -v
docker compose up -d
docker compose exec app mvn flyway:migrate

# Access database directly
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SA_PASSWORD" \
  -Q "SELECT name, state_desc FROM sys.databases"

# Check API health from inside container
docker compose exec app curl -s http://localhost:8080/actuator/health

# View Prometheus metrics
curl -s https://api.blood.example.com/actuator/prometheus | grep -E "^http_server_requests|^hikaricp|^jvm"

# Force garbage collection (for testing)
docker compose exec app jcmd $(docker compose exec app jps | grep BloodApplication | awk '{print $1}') GC.run

# Clear Caffeine cache (from inside container)
curl -X POST https://api.blood.example.com/actuator/caches/clear

# Manually create test user
curl -X POST https://api.blood.example.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@blood.example.com","password":"Test@123456","firstName":"Test","lastName":"User","bloodGroup":"O_POSITIVE","confirmPassword":"Test@123456"}'
```

---

## Appendix B: Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing key (min 64 chars) | `openssl rand -base64 64` |
| `DB_PASSWORD` | SQL Server SA password | From Key Vault |
| `CORS_ORIGINS` | Allowed frontend origins | `https://blood.example.com` |
| `SPRING_PROFILES_ACTIVE` | Spring profile | `prod` |
| `LOG_APPENDER` | Log format | `JSON` (prod), `CONSOLE` (dev) |
| `HSTS_MAX_AGE` | HSTS duration in seconds | `31536000` (1 year) |
| `RATE_LIMIT_PER_IP` | Requests per minute per IP | `100` |
| `MANAGEMENT_PROMETHEUS_EXPORT_ENABLED` | Enable Prometheus metrics | `true` |

---

*Runbook được tạo tự động — Cập nhật: 2026-07-27*
*Người phụ trách: Development Team*
