#!/bin/bash

##############################################################
# K-System Monitoring - Update Deployment Script
# สำหรับอัพเดทระบบบน Production Server
##############################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/opt/k-system-monitoring"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  K-System Update Deployment${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}[!] Project directory not found: ${PROJECT_DIR}${NC}"
    echo -e "${YELLOW}[*] กรุณารัน server-deploy.sh ก่อน${NC}"
    exit 1
fi

cd $PROJECT_DIR

# Backup current version
echo -e "${YELLOW}[1/6] กำลัง Backup current version...${NC}"
BACKUP_DIR="$HOME/k-system-backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
cp -r $PROJECT_DIR $BACKUP_DIR/
echo -e "${GREEN}[✓] Backup saved to: ${BACKUP_DIR}${NC}"

# Stop services
echo -e "${YELLOW}[2/6] กำลังหยุด services...${NC}"
pm2 stop all || true
echo -e "${GREEN}[✓] Services stopped${NC}"

# Pull latest code
echo -e "${YELLOW}[3/6] กำลัง Pull code ใหม่จาก Git...${NC}"
git fetch --all
git pull origin main
echo -e "${GREEN}[✓] Code updated${NC}"

# Install/update dependencies
echo -e "${YELLOW}[4/6] กำลังอัพเดท dependencies...${NC}"
npm install
echo -e "${GREEN}[✓] Dependencies updated${NC}"

# Build application
echo -e "${YELLOW}[5/6] กำลัง Build application...${NC}"
npm run build
echo -e "${GREEN}[✓] Application built${NC}"

# Restart services
echo -e "${YELLOW}[6/6] กำลังเริ่มต้น services...${NC}"
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}[✓] Services started${NC}"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  อัพเดทเสร็จสมบูรณ์!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "ตรวจสอบสถานะ services:"
echo -e "  ${BLUE}pm2 status${NC}"
echo ""
echo -e "ดู logs:"
echo -e "  ${BLUE}pm2 logs${NC}"
echo ""
