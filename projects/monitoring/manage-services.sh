#!/bin/bash

##############################################################
# K-System Monitoring - Service Management Script
# สำหรับจัดการ services ทั้งหมด
##############################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get command
COMMAND=$1

# Functions
show_usage() {
    echo -e "${BLUE}K-System Service Management${NC}"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|logs}"
    echo ""
    echo "Commands:"
    echo "  start    - เริ่มต้น services ทั้งหมด"
    echo "  stop     - หยุด services ทั้งหมด"
    echo "  restart  - Restart services ทั้งหมด"
    echo "  status   - แสดงสถานะ services"
    echo "  logs     - แสดง logs แบบ real-time"
    echo ""
}

start_services() {
    echo -e "${YELLOW}[*] กำลังเริ่มต้น K-System services...${NC}"

    # Start PM2 services
    cd /opt/k-system-monitoring
    pm2 start ecosystem.config.js

    # Check system services
    sudo systemctl start mysql
    sudo systemctl start influxdb
    sudo systemctl start nginx

    echo -e "${GREEN}[✓] Services started${NC}"
    show_status
}

stop_services() {
    echo -e "${YELLOW}[*] กำลังหยุด K-System services...${NC}"

    # Stop PM2 services
    pm2 stop all

    echo -e "${GREEN}[✓] Services stopped${NC}"
    show_status
}

restart_services() {
    echo -e "${YELLOW}[*] กำลัง Restart K-System services...${NC}"

    # Restart PM2 services
    pm2 restart all

    # Restart system services
    sudo systemctl restart mysql
    sudo systemctl restart influxdb
    sudo systemctl reload nginx

    echo -e "${GREEN}[✓] Services restarted${NC}"
    show_status
}

show_status() {
    echo ""
    echo -e "${BLUE}=== PM2 Services ===${NC}"
    pm2 status

    echo ""
    echo -e "${BLUE}=== System Services ===${NC}"
    echo -e "${YELLOW}MySQL:${NC}"
    sudo systemctl status mysql --no-pager -l | head -n 5

    echo ""
    echo -e "${YELLOW}InfluxDB:${NC}"
    sudo systemctl status influxdb --no-pager -l | head -n 5

    echo ""
    echo -e "${YELLOW}nginx:${NC}"
    sudo systemctl status nginx --no-pager -l | head -n 5

    echo ""
    echo -e "${BLUE}=== URLs ===${NC}"
    echo -e "Web Application: ${GREEN}http://localhost${NC}"
    echo -e "Node-RED: ${GREEN}http://localhost/node-red${NC}"
    echo -e "InfluxDB UI: ${GREEN}http://localhost:8086${NC}"
}

show_logs() {
    echo -e "${YELLOW}[*] แสดง PM2 logs (กด Ctrl+C เพื่อออก)...${NC}"
    pm2 logs
}

# Main script
case "$COMMAND" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
