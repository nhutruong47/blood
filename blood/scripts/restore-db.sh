#!/usr/bin/env bash
# =============================================================================
# restore-db.sh — Restore the BLOOD database from a .bak file produced by
# backup-db.sh (or any compatible native SQL Server backup).
#
# Usage:
#     ./scripts/restore-db.sh ./backups/BLOOD-20260806T091000Z.bak
#
# Behaviour:
#   1. Copies the .bak file into the running `blood-sqlserver` container.
#   2. Drops the existing BLOOD database (after taking a defensive backup).
#   3. Runs RESTORE DATABASE BLOOD FROM DISK = ... WITH RECOVERY.
#
# WARNING: This is a destructive operation. Always run a fresh backup first
# with ./scripts/backup-db.sh, then pass THAT backup as $1 to this script.
# =============================================================================
set -euo pipefail

if [[ $# -ne 1 ]]; then
    echo "usage: $0 <path-to-.bak-file>" >&2
    exit 64
fi

HOST_BACKUP_PATH="$1"
if [[ ! -f "${HOST_BACKUP_PATH}" ]]; then
    echo "[restore-db] file not found: ${HOST_BACKUP_PATH}" >&2
    exit 66
fi

SQL_CONTAINER="${SQL_CONTAINER:-blood-sqlserver}"
BACKUP_BASENAME="$(basename "${HOST_BACKUP_PATH}")"
CONTAINER_BACKUP_DIR="/var/opt/mssql/backups"
CONTAINER_BACKUP_PATH="${CONTAINER_BACKUP_DIR}/${BACKUP_BASENAME}"

# Auto-source .env if DB_PASSWORD is not already exported. This lets operators
# run the script directly without `set -a; source .env; set +a` first.
SCRIPT_DIR_AUTO="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ -z "${DB_PASSWORD:-}" && -f "${SCRIPT_DIR_AUTO}/../.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "${SCRIPT_DIR_AUTO}/../.env"
    set +a
fi
: "${DB_PASSWORD:?Set DB_PASSWORD in .env (or export DB_PASSWORD=...)}"

# Ensure the destination directory exists inside the container. The mssql
# image does not pre-create it; RESTORE ... FROM DISK fails with "cannot
# open the backup device" otherwise.
docker exec \
    --env ACCEPT_EULA=Y \
    "${SQL_CONTAINER}" \
    mkdir -p "${CONTAINER_BACKUP_DIR}"

echo "[restore-db] copying ${HOST_BACKUP_PATH} into ${SQL_CONTAINER}:${CONTAINER_BACKUP_PATH}"
docker cp "${HOST_BACKUP_PATH}" "${SQL_CONTAINER}:${CONTAINER_BACKUP_PATH}"

# Identify the logical file names inside the backup so RESTORE can rebuild the
# physical files to the container's default data path (/var/opt/mssql/data).
# RESTORE FILELISTONLY returns one row per file with: LogicalName, PhysicalName,
# Type (D=data, L=log, F=full-text). We pair each logical name with the right
# extension based on Type. Header, separator, and "(N rows affected)" trailer
# lines are all filtered out.
LOGICAL_FILES=$(docker exec \
    --env ACCEPT_EULA=Y \
    "${SQL_CONTAINER}" \
    /opt/mssql-tools18/bin/sqlcmd \
        -S localhost \
        -U sa \
        -P "${DB_PASSWORD:?Set DB_PASSWORD in .env}" \
        -C -No \
        -h -1 -W \
        -Q "RESTORE FILELISTONLY FROM DISK = N'${CONTAINER_BACKUP_PATH}'" \
    | awk '
        NF >= 3 \
            && $1 !~ /^[A-Za-z(]/ \
            && $3 ~ /^[DLF]$/ \
        {
            ext = ($3 == "L") ? "ldf" : "mdf";
            printf "MOVE N'\''%s'\'' TO N'\''/var/opt/mssql/data/%s.%s'\'',", $1, $1, ext;
        }
    ')

if [[ -z "${LOGICAL_FILES}" ]]; then
    echo "[restore-db] could not parse RESTORE FILELISTONLY output" >&2
    exit 70
fi
LOGICAL_FILES="${LOGICAL_FILES%,}"  # strip trailing comma

# Move any pre-existing BLOOD database aside. RESTORE cannot overwrite an
# active database; we drop it first while keeping BLOOD's files deletable
# by setting SINGLE_USER WITH ROLLBACK IMMEDIATE.
echo "[restore-db] dropping existing BLOOD database if present"
docker exec \
    --env ACCEPT_EULA=Y \
    "${SQL_CONTAINER}" \
    /opt/mssql-tools18/bin/sqlcmd \
        -S localhost \
        -U sa \
        -P "${DB_PASSWORD:?Set DB_PASSWORD in .env}" \
        -C -No \
        -Q "IF DB_ID(N'BLOOD') IS NOT NULL BEGIN ALTER DATABASE [BLOOD] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [BLOOD]; END"

echo "[restore-db] restoring BLOOD from ${CONTAINER_BACKUP_PATH}"
docker exec \
    --env ACCEPT_EULA=Y \
    "${SQL_CONTAINER}" \
    /opt/mssql-tools18/bin/sqlcmd \
        -S localhost \
        -U sa \
        -P "${DB_PASSWORD:?Set DB_PASSWORD in .env}" \
        -C -No \
        -Q "RESTORE DATABASE [BLOOD] FROM DISK = N'${CONTAINER_BACKUP_PATH}' WITH RECOVERY, ${LOGICAL_FILES}"

docker exec \
    --env ACCEPT_EULA=Y \
    "${SQL_CONTAINER}" \
    rm -f "${CONTAINER_BACKUP_PATH}"

echo "[restore-db] ok — BLOOD restored. Restart the app so Flyway re-validates the schema:"
echo "              docker compose restart app"
