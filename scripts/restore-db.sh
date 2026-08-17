#!/bin/bash
# ==============================================================================
# FOOTBALL MEDIA PLATFORM — PRODUCTION DATABASE RESTORE SCRIPT
# ==============================================================================
set -e

if [ -z "$1" ]; then
  echo "❌ Error: Please specify backup file to restore."
  echo "Usage: ./restore-db.sh /path/to/fmp_backup_YYYYMMDD_HHMMSS.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: Backup file '${BACKUP_FILE}' not found."
  exit 1
fi

echo "⚠️  WARNING: This will restore database from ${BACKUP_FILE}."
echo "⚠️  Existing data in ${POSTGRES_DB:-fmp_production} will be overwritten."

# Verify checksum if available
if [ -f "${BACKUP_FILE}.sha256" ]; then
  echo "🔍 Verifying SHA256 checksum..."
  sha256sum -c "${BACKUP_FILE}.sha256"
  echo "✅ Checksum verification passed."
fi

read -p "Type 'CONFIRM_RESTORE' to proceed: " CONFIRMATION
if [ "${CONFIRMATION}" != "CONFIRM_RESTORE" ]; then
  echo "🛑 Restore aborted by user."
  exit 1
fi

echo "🔄 Restoring database into fmp_postgres_prod..."
gunzip -c "${BACKUP_FILE}" | docker exec -i fmp_postgres_prod psql -U "${POSTGRES_USER:-fmp_admin}" -d "${POSTGRES_DB:-fmp_production}"

echo "✅ Database restore successfully completed."
