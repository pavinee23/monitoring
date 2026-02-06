#!/bin/bash

##############################################################
# K-System Monitoring - Server Deployment Script
# สำหรับติดตั้งบน Production Server (Ubuntu/Debian)
# โดยไม่ใช้ Docker
##############################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="k-system-monitoring"
PROJECT_DIR="/opt/${PROJECT_NAME}"
NODE_VERSION="20"
MYSQL_ROOT_PASSWORD="your_secure_mysql_password"
INFLUXDB_VERSION="2.7"
NODERED_PORT=1880
NEXTJS_PORT=3001
API_PORT=8080

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  K-System Server Deployment Script${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[!] กรุณารัน script นี้ด้วย sudo${NC}"
    echo -e "    sudo bash $0"
    exit 1
fi

# Get actual user (in case running with sudo)
ACTUAL_USER=${SUDO_USER:-$USER}

echo -e "${YELLOW}[*] Script นี้จะติดตั้ง:${NC}"
echo "    - Node.js ${NODE_VERSION}.x"
echo "    - MySQL Server"
echo "    - InfluxDB ${INFLUXDB_VERSION}"
echo "    - Node-RED"
echo "    - PM2 Process Manager"
echo "    - nginx (Reverse Proxy)"
echo "    - K-System Monitoring Application"
echo ""
read -p "ต้องการดำเนินการต่อหรือไม่? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}[!] ยกเลิกการติดตั้ง${NC}"
    exit 1
fi

##############################################################
# 1. Update System
##############################################################
echo -e "\n${GREEN}[1/10] กำลัง Update ระบบ...${NC}"
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y curl wget git build-essential software-properties-common apt-transport-https ca-certificates gnupg

##############################################################
# 2. Install Node.js
##############################################################
echo -e "\n${GREEN}[2/10] กำลังติดตั้ง Node.js ${NODE_VERSION}.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}[✓] ติดตั้ง Node.js เสร็จสิ้น: $(node -v)${NC}"
else
    echo -e "${YELLOW}[*] Node.js ติดตั้งอยู่แล้ว: $(node -v)${NC}"
fi

##############################################################
# 3. Install PM2 Process Manager
##############################################################
echo -e "\n${GREEN}[3/10] กำลังติดตั้ง PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u $ACTUAL_USER --hp /home/$ACTUAL_USER
    echo -e "${GREEN}[✓] ติดตั้ง PM2 เสร็จสิ้น${NC}"
else
    echo -e "${YELLOW}[*] PM2 ติดตั้งอยู่แล้ว: $(pm2 -v)${NC}"
fi

##############################################################
# 4. Install MySQL Server
##############################################################
echo -e "\n${GREEN}[4/10] กำลังติดตั้ง MySQL Server...${NC}"
if ! command -v mysql &> /dev/null; then
    # Set non-interactive mode
    export DEBIAN_FRONTEND=noninteractive

    # Pre-configure MySQL root password
    echo "mysql-server mysql-server/root_password password ${MYSQL_ROOT_PASSWORD}" | debconf-set-selections
    echo "mysql-server mysql-server/root_password_again password ${MYSQL_ROOT_PASSWORD}" | debconf-set-selections

    apt-get install -y mysql-server

    # Secure MySQL installation
    mysql -u root -p${MYSQL_ROOT_PASSWORD} <<-EOF
        DELETE FROM mysql.user WHERE User='';
        DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
        DROP DATABASE IF EXISTS test;
        DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
        FLUSH PRIVILEGES;
EOF

    # Create K-System database
    mysql -u root -p${MYSQL_ROOT_PASSWORD} <<-EOF
        CREATE DATABASE IF NOT EXISTS ksystem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        CREATE USER IF NOT EXISTS 'ksystem'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
        GRANT ALL PRIVILEGES ON ksystem.* TO 'ksystem'@'localhost';
        FLUSH PRIVILEGES;
EOF

    echo -e "${GREEN}[✓] ติดตั้ง MySQL เสร็จสิ้น${NC}"
else
    echo -e "${YELLOW}[*] MySQL ติดตั้งอยู่แล้ว${NC}"
fi

##############################################################
# 5. Install InfluxDB
##############################################################
echo -e "\n${GREEN}[5/10] กำลังติดตั้ง InfluxDB ${INFLUXDB_VERSION}...${NC}"
if ! command -v influxd &> /dev/null; then
    # Add InfluxDB repository
    wget -q https://repos.influxdata.com/influxdata-archive_compat.key
    echo '393e8779c89ac8d958f81f942f9ad7fb82a25e133faddaf92e15b16e6ac9ce4c influxdata-archive_compat.key' | sha256sum -c && cat influxdata-archive_compat.key | gpg --dearmor | tee /etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg > /dev/null
    echo 'deb [signed-by=/etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg] https://repos.influxdata.com/debian stable main' | tee /etc/apt/sources.list.d/influxdata.list

    apt-get update -qq
    apt-get install -y influxdb2

    # Start InfluxDB
    systemctl enable influxdb
    systemctl start influxdb

    # Wait for InfluxDB to start
    sleep 5

    echo -e "${GREEN}[✓] ติดตั้ง InfluxDB เสร็จสิ้น${NC}"
    echo -e "${YELLOW}[!] คุณจะต้อง setup InfluxDB ด้วยคำสั่ง: influx setup${NC}"
else
    echo -e "${YELLOW}[*] InfluxDB ติดตั้งอยู่แล้ว${NC}"
fi

##############################################################
# 6. Install Node-RED
##############################################################
echo -e "\n${GREEN}[6/10] กำลังติดตั้ง Node-RED...${NC}"
if ! command -v node-red &> /dev/null; then
    npm install -g --unsafe-perm node-red

    # Install Node-RED Modbus nodes
    cd /home/$ACTUAL_USER/.node-red || mkdir -p /home/$ACTUAL_USER/.node-red && cd /home/$ACTUAL_USER/.node-red
    npm install node-red-contrib-modbus
    npm install node-red-contrib-influxdb

    chown -R $ACTUAL_USER:$ACTUAL_USER /home/$ACTUAL_USER/.node-red

    echo -e "${GREEN}[✓] ติดตั้ง Node-RED เสร็จสิ้น${NC}"
else
    echo -e "${YELLOW}[*] Node-RED ติดตั้งอยู่แล้ว${NC}"
fi

##############################################################
# 7. Install nginx
##############################################################
echo -e "\n${GREEN}[7/10] กำลังติดตั้ง nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl enable nginx
    echo -e "${GREEN}[✓] ติดตั้ง nginx เสร็จสิ้น${NC}"
else
    echo -e "${YELLOW}[*] nginx ติดตั้งอยู่แล้ว${NC}"
fi

##############################################################
# 8. Clone and Setup K-System Project
##############################################################
echo -e "\n${GREEN}[8/10] กำลัง Clone และ Setup โปรเจกต์...${NC}"

# Create project directory
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clone or update repository
if [ -d ".git" ]; then
    echo -e "${YELLOW}[*] อัพเดทโปรเจกต์...${NC}"
    git pull
else
    echo -e "${YELLOW}[*] Clone โปรเจกต์...${NC}"
    cd ..
    rm -rf $PROJECT_DIR
    git clone https://github.com/pavinee23/monitoring.git $PROJECT_DIR
    cd $PROJECT_DIR
fi

# Install Next.js dependencies
echo -e "${YELLOW}[*] ติดตั้ง dependencies...${NC}"
npm install

# Build Next.js application
echo -e "${YELLOW}[*] Build Next.js application...${NC}"
npm run build

# Set ownership
chown -R $ACTUAL_USER:$ACTUAL_USER $PROJECT_DIR

echo -e "${GREEN}[✓] Setup โปรเจกต์เสร็จสิ้น${NC}"

##############################################################
# 9. Configure Environment Variables
##############################################################
echo -e "\n${GREEN}[9/10] กำลัง Configure Environment Variables...${NC}"

cat > $PROJECT_DIR/.env.local <<EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=ksystem
DB_PASSWORD=${MYSQL_ROOT_PASSWORD}
DB_NAME=ksystem

# InfluxDB Configuration
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=your_influxdb_token_here
INFLUXDB_ORG=k-system
INFLUXDB_BUCKET=monitoring

# Node-RED Configuration
NODERED_URL=http://localhost:${NODERED_PORT}

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:${API_PORT}
NODE_ENV=production

# Session Secret
SESSION_SECRET=$(openssl rand -hex 32)
EOF

chown $ACTUAL_USER:$ACTUAL_USER $PROJECT_DIR/.env.local

echo -e "${GREEN}[✓] Environment variables configured${NC}"
echo -e "${YELLOW}[!] โปรดแก้ไข .env.local และใส่ INFLUXDB_TOKEN ที่ถูกต้อง${NC}"

##############################################################
# 10. Setup PM2 and nginx
##############################################################
echo -e "\n${GREEN}[10/10] กำลัง Setup PM2 และ nginx...${NC}"

# Create PM2 ecosystem file
cat > $PROJECT_DIR/ecosystem.config.js <<'EOF'
module.exports = {
  apps: [
    {
      name: 'k-system-web',
      script: 'npm',
      args: 'start',
      cwd: '/opt/k-system-monitoring',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'node-red',
      script: 'node-red',
      cwd: '/home/' + process.env.SUDO_USER + '/.node-red',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
};
EOF

# Setup nginx reverse proxy
cat > /etc/nginx/sites-available/k-system <<'EOF'
# Main Web Application
server {
    listen 80;
    server_name _;

    # Next.js Application
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Node-RED
    location /node-red/ {
        proxy_pass http://localhost:1880/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# Enable nginx site
ln -sf /etc/nginx/sites-available/k-system /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx

echo -e "${GREEN}[✓] nginx configured${NC}"

##############################################################
# Completion
##############################################################
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  การติดตั้งเสร็จสมบูรณ์!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}ขั้นตอนถัดไป:${NC}"
echo ""
echo -e "1. Setup InfluxDB:"
echo -e "   ${BLUE}influx setup${NC}"
echo -e "   แล้วคัดลอก Token ไปใส่ใน ${PROJECT_DIR}/.env.local"
echo ""
echo -e "2. Import Node-RED flows:"
echo -e "   - เข้า http://your-server-ip/node-red/"
echo -e "   - Import flows จาก ${PROJECT_DIR}/nodered/"
echo ""
echo -e "3. Import MySQL schema:"
echo -e "   ${BLUE}mysql -u ksystem -p${MYSQL_ROOT_PASSWORD} ksystem < ${PROJECT_DIR}/database/schema.sql${NC}"
echo ""
echo -e "4. เริ่มต้น services ด้วย PM2:"
echo -e "   ${BLUE}su - ${ACTUAL_USER} -c 'cd ${PROJECT_DIR} && pm2 start ecosystem.config.js'${NC}"
echo -e "   ${BLUE}su - ${ACTUAL_USER} -c 'pm2 save'${NC}"
echo ""
echo -e "5. เข้าใช้งานระบบ:"
echo -e "   - Web Application: ${GREEN}http://your-server-ip${NC}"
echo -e "   - Node-RED: ${GREEN}http://your-server-ip/node-red${NC}"
echo ""
echo -e "${YELLOW}ข้อมูลสำคัญ:${NC}"
echo -e "   - MySQL Root Password: ${MYSQL_ROOT_PASSWORD}"
echo -e "   - MySQL Database: ksystem"
echo -e "   - MySQL User: ksystem"
echo -e "   - Project Directory: ${PROJECT_DIR}"
echo -e "   - Environment File: ${PROJECT_DIR}/.env.local"
echo ""
echo -e "${RED}[!] กรุณาเปลี่ยน MySQL password ในไฟล์ .env.local${NC}"
echo ""
