#!/bin/bash

##############################################################
# K-System Monitoring - Backup Script
# สำหรับสำรองข้อมูลระบบ
##############################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_DIR="/opt/k-system-monitoring"
BACKUP_BASE_DIR="$HOME/k-system-backups"
BACKUP_DIR="$BACKUP_BASE_DIR/$(date +%Y%m%d_%H%M%S)"
MYSQL_USER="ksystem"
MYSQL_DB="ksystem"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  K-System Backup Script${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Create backup directory
mkdir -p $BACKUP_DIR

# 1. Backup MySQL Database
echo -e "${YELLOW}[1/5] กำลัง Backup MySQL database...${NC}"
read -sp "Enter MySQL password for user '$MYSQL_USER': " MYSQL_PASSWORD
echo ""

mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DB > $BACKUP_DIR/mysql-backup.sql
echo -e "${GREEN}[✓] MySQL backup saved${NC}"

# 2. Backup InfluxDB
echo -e "${YELLOW}[2/5] กำลัง Backup InfluxDB...${NC}"
if command -v influx &> /dev/null; then
    read -p "Enter InfluxDB Token: " INFLUX_TOKEN
    influx backup $BACKUP_DIR/influxdb-backup -t $INFLUX_TOKEN 2>/dev/null || echo -e "${YELLOW}[!] InfluxDB backup skipped (ไม่พบ token หรือ permission)${NC}"
else
    echo -e "${YELLOW}[!] InfluxDB CLI not found, skipping backup${NC}"
fi

# 3. Backup Node-RED Flows
echo -e "${YELLOW}[3/5] กำลัง Backup Node-RED flows...${NC}"
if [ -f "$HOME/.node-red/flows.json" ]; then
    cp $HOME/.node-red/flows.json $BACKUP_DIR/nodered-flows.json
    cp $HOME/.node-red/flows_cred.json $BACKUP_DIR/nodered-flows_cred.json 2>/dev/null || true
    echo -e "${GREEN}[✓] Node-RED flows backup saved${NC}"
else
    echo -e "${YELLOW}[!] Node-RED flows not found${NC}"
fi

# 4. Backup Project Files
echo -e "${YELLOW}[4/5] กำลัง Backup project files...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    # Backup important files only (not node_modules, .next, etc.)
    mkdir -p $BACKUP_DIR/project

    # Copy configuration files
    cp $PROJECT_DIR/.env.local $BACKUP_DIR/project/ 2>/dev/null || true
    cp $PROJECT_DIR/ecosystem.config.js $BACKUP_DIR/project/ 2>/dev/null || true
    cp $PROJECT_DIR/package.json $BACKUP_DIR/project/
    cp $PROJECT_DIR/package-lock.json $BACKUP_DIR/project/ 2>/dev/null || true

    # Copy custom code (app, api, lib, etc.)
    cp -r $PROJECT_DIR/app $BACKUP_DIR/project/ 2>/dev/null || true
    cp -r $PROJECT_DIR/api $BACKUP_DIR/project/ 2>/dev/null || true
    cp -r $PROJECT_DIR/lib $BACKUP_DIR/project/ 2>/dev/null || true
    cp -r $PROJECT_DIR/public $BACKUP_DIR/project/ 2>/dev/null || true

    echo -e "${GREEN}[✓] Project files backup saved${NC}"
else
    echo -e "${YELLOW}[!] Project directory not found${NC}"
fi

# 5. Create compressed archive
echo -e "${YELLOW}[5/5] กำลังสร้าง compressed archive...${NC}"
cd $BACKUP_BASE_DIR
tar -czf $(basename $BACKUP_DIR).tar.gz $(basename $BACKUP_DIR)
ARCHIVE_SIZE=$(du -h $(basename $BACKUP_DIR).tar.gz | cut -f1)

echo -e "${GREEN}[✓] Compressed archive created${NC}"

# Cleanup old backups (keep last 7 days)
echo -e "${YELLOW}[*] ลบ backups เก่า (เก็บไว้แค่ 7 วันล่าสุด)...${NC}"
find $BACKUP_BASE_DIR -name "*.tar.gz" -type f -mtime +7 -delete
find $BACKUP_BASE_DIR -type d -mtime +7 -delete 2>/dev/null || true

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Backup เสร็จสมบูรณ์!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "Backup location:"
echo -e "  Directory: ${BLUE}${BACKUP_DIR}${NC}"
echo -e "  Archive: ${BLUE}${BACKUP_DIR}.tar.gz${NC}"
echo -e "  Size: ${BLUE}${ARCHIVE_SIZE}${NC}"
echo ""
echo -e "Backup includes:"
echo -e "  ✓ MySQL database"
echo -e "  ✓ InfluxDB data (ถ้ามี)"
echo -e "  ✓ Node-RED flows"
echo -e "  ✓ Project configuration files"
echo ""
echo -e "To restore from this backup:"
echo -e "  ${BLUE}tar -xzf ${BACKUP_DIR}.tar.gz${NC}"
echo -e "  ${BLUE}mysql -u $MYSQL_USER -p $MYSQL_DB < ${BACKUP_DIR}/mysql-backup.sql${NC}"
echo ""
