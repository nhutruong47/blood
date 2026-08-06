#!/usr/bin/env bash
# =============================================================================
# backup-db.sh — Take a full SQL Server backup of the BLOOD database.
#
# Runs `sqlcmd` inside the running `blood-sqlserver` container and copies the
# resulting .bak file out to ./backups/ on the host. The host only needs bash
# and docker; no sqlcmd install is required.
#
# Usage:
#     ./scripts/backup-db.sh                # writes ./backups/BLOOD-<UTC>.bak
#     BACKUP_DIR=/path/to/dir ./scripts/backup-db.sh
#
# Required: the docker compose stack must be running (docker compose up -d)
# and the BLOOD database must already exist (the app starts before this script
# is useful).
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-${REPO_ROOT}/backups}"
SQL_CONTAINER="${SQL_CONTAINER:-blood-sqlserver}"

mkdir -p "${BACKUP_DIR}"

# Auto-source .env if DB_PASSWORD is not already exported. This lets operators
# run the script directly without `set -a; source .env; set +a` first.
if [[ -z "${DB_PASSWORD:-}" && -f "${REPO_ROOT}/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "${REPO_ROOT}/.env"
    set +a
fi
: "${DB_PASSWORD:?Set DB_PASSWORD in .env (or export DB_PASSWORD=...)}"

# UTC timestamp keeps filenames sortable and timezone-independent.
TS="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_BASENAME="BLOOD-${TS}.bak"
CONTAINER_BACKUP_DIR="/var/opt/mssql/backups"
CONTAINER_BACKUP_PATH="${CONTAINER_BACKUP_DIR}/${BACKUP_BASENAME}"
HOST_BACKUP_PATH="${BACKUP_DIR}/${BACKUP_BASENAME}"

# Ensure the destination directory exists inside the container. The mssql
# image does not pre-create it, and BACKUP DATABASE ... TO DISK fails with
# "cannot open the backup device" otherwise.
docker exec \
    --env ACCEPT_EULA=Y \
    "${SQL_CONTAINER}" \
    mkdir -p "${CONTAINER_BACKUP_DIR}"

echo "[backup-db] writing ${HOST_BACKUP_PATH}"

docker exec \
    --env ACCEPT_EULA=Y \
    "${SQL_CONTAINER}" \
    /opt/mssql-tools18/bin/sqlcmd \
        -S localhost \
        -U sa \
        -P "${DB_PASSWORD:?Set DB_PASSWORD in .env}" \
        -C -No \
        -Q "BACKUP DATABASE [BLOOD] TO DISK = N'${CONTAINER_BACKUP_PATH}' WITH INIT, COMPRESSION, STATS = 10"

docker cp "${SQL_CONTAINER}:${CONTAINER_BACKUP_PATH}" "${HOST_BACKUP_PATH}"

# Clean up inside the container so /var/opt/mssql doesn't accumulate files.
docker exec \
    --env ACCEPT_EULA=Y \
    "${SQL_CONTAINER}" \
    rm -f "${CONTAINER_BACKUP_PATH}"

echo "[backup-db] ok — $(du -h "${HOST_BACKUP_PATH}" | cut -f1) at ${HOST_BACKUP_PATH}"
