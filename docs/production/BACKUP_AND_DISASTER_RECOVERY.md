# Backup & Disaster Recovery Architecture

## 1. Objectives & Metrics
- **Recovery Point Objective (RPO)**: $< 1\text{ hour}$
- **Recovery Time Objective (RTO)**: $< 15\text{ minutes}$

## 2. Backup Strategy
1. **Automated Daily Logical Dumps**:
   - Executed via `scripts/backup-db.sh` using `pg_dump` with gzip compression and SHA256 integrity checksums.
   - Retained locally for 30 days.
2. **Offsite Backup Replication**:
   - Daily snapshots uploaded to S3 / Cloudflare R2 object storage in an isolated region.
3. **Transaction Logs (WAL)**:
   - Continuous archiving enabled on PostgreSQL production instance for point-in-time recovery.

## 3. Step-by-Step Restoration Procedure
1. Identify target backup snapshot:
   ```bash
   ls -la /var/backups/fmp_postgres/
   ```
2. Run interactive restore script:
   ```bash
   ./scripts/restore-db.sh /var/backups/fmp_postgres/fmp_backup_YYYYMMDD_HHMMSS.sql.gz
   ```
3. Type `CONFIRM_RESTORE` to execute.
4. Verify database health:
   ```bash
   curl http://localhost:3000/api/health
   ```
5. Perform smoke tests across core routes.
