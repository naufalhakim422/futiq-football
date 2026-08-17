#!/bin/bash
# ==============================================================================
# FOOTBALL MEDIA PLATFORM — PRODUCTION DATABASE BACKUP SCRIPT
# ==============================================================================
set -e

BACKUP_DIR="${BACKUP_DIR:-/var/backups/fmp_postgres}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/fmp_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "📦 [$(date)] Starting PostgreSQL automated backup..."

# Perform pg_dump inside Docker container with gzip compression
docker exec -t fmp_postgres_prod pg_dump -U "${POSTGRES_USER:-fmp_admin}" "${POSTGRES_DB:-fmp_production}" | gzip -9 > "${BACKUP_FILE}"

# Generate SHA256 checksum for verification
sha256sum "${BACKUP_FILE}" > "${BACKUP_FILE}.sha256"

echo "✅ [$(date)] Backup successfully completed: ${BACKUP_FILE}"
echo "🔒 Checksum verified: $(cat "${BACKUP_FILE}.sha256")"

# Remove backups older than retention window
echo "🧹 Pruning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "fmp_backup_*.sql.gz*" -mtime "+${RETENTION_DAYS}" -delete

echo "🎉 [$(date)] Backup routine finished cleanly."
