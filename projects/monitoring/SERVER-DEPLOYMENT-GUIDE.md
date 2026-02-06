# 🚀 K-System Server Deployment Guide

คู่มือการติดตั้งระบบ K-System Monitoring บน Production Server
โดยไม่ใช้ Docker (Direct Installation)

---

## 📋 สารบัญ

1. [ข้อกำหนดของ Server](#ข้อกำหนดของ-server)
2. [การเตรียมความพร้อม](#การเตรียมความพร้อม)
3. [วิธีการติดตั้งแบบอัตโนมัติ](#วิธีการติดตั้งแบบอัตโนมัติ)
4. [วิธีการติดตั้งแบบ Manual](#วิธีการติดตั้งแบบ-manual)
5. [การตั้งค่าหลังการติดตั้ง](#การตั้งค่าหลังการติดตั้ง)
6. [การจัดการ Services](#การจัดการ-services)
7. [Troubleshooting](#troubleshooting)

---

## ข้อกำหนดของ Server

### ระบบปฏิบัติการ
- Ubuntu 20.04 LTS หรือใหม่กว่า
- Debian 11 หรือใหม่กว่า
- หรือ Linux distribution อื่นๆ ที่รองรับ systemd

### Hardware Requirements
- **CPU**: 2 cores ขึ้นไป
- **RAM**: 4GB ขึ้นไป (แนะนำ 8GB)
- **Storage**: 20GB ว่างขึ้นไป
- **Network**: เชื่อมต่ออินเทอร์เน็ตได้

### Software Requirements (จะติดตั้งอัตโนมัติ)
- Node.js 20.x
- MySQL 8.0+
- InfluxDB 2.7+
- Node-RED
- PM2
- nginx

---

## การเตรียมความพร้อม

### 1. เข้า Server ผ่าน SSH

```bash
ssh username@your-server-ip
```

### 2. Update ระบบ

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. ติดตั้ง Git (ถ้ายังไม่มี)

```bash
sudo apt install -y git
```

---

## วิธีการติดตั้งแบบอัตโนมัติ

### ขั้นตอนที่ 1: Clone โปรเจกต์

```bash
cd ~
git clone https://github.com/pavinee23/monitoring.git
cd monitoring
```

### ขั้นตอนที่ 2: แก้ไข Configuration (ถ้าต้องการ)

เปิดไฟล์ `server-deploy.sh` และแก้ไข configuration ตามต้องการ:

```bash
nano server-deploy.sh
```

สิ่งที่ควรแก้ไข:
```bash
MYSQL_ROOT_PASSWORD="your_secure_mysql_password"  # เปลี่ยนเป็น password ที่ต้องการ
NODERED_PORT=1880
NEXTJS_PORT=3001
API_PORT=8080
```

### ขั้นตอนที่ 3: รัน Deployment Script

```bash
chmod +x server-deploy.sh
sudo ./server-deploy.sh
```

Script จะทำการติดตั้งทุกอย่างอัตโนมัติ รวมถึง:
- ✅ Node.js และ npm
- ✅ MySQL Server
- ✅ InfluxDB
- ✅ Node-RED
- ✅ PM2 Process Manager
- ✅ nginx Reverse Proxy
- ✅ Clone และ build โปรเจกต์

**⏱️ ระยะเวลาประมาณ: 10-15 นาที**

---

## การตั้งค่าหลังการติดตั้ง

### 1. Setup InfluxDB

```bash
influx setup
```

กรอกข้อมูล:
- **Username**: admin
- **Password**: [your-influxdb-password]
- **Organization**: k-system
- **Bucket**: monitoring
- **Retention Period**: 0 (unlimited)

จดบันทึก **Token** ที่ได้

### 2. แก้ไข Environment Variables

```bash
sudo nano /opt/k-system-monitoring/.env.local
```

แก้ไข:
```env
# InfluxDB Configuration
INFLUXDB_TOKEN=your_actual_influxdb_token_here

# อัพเดท MySQL password ถ้าเปลี่ยน
DB_PASSWORD=your_mysql_password
```

### 3. Import MySQL Schema

```bash
# ถ้ามีไฟล์ schema
sudo mysql -u ksystem -p ksystem < /opt/k-system-monitoring/database/schema.sql

# หรือ import ข้อมูลจาก backup
sudo mysql -u ksystem -p ksystem < /opt/k-system-monitoring/database/backup.sql
```

### 4. Setup Node-RED Flows

1. เข้า Node-RED: `http://your-server-ip/node-red/`
2. ไปที่ Menu (☰) → Import
3. เลือกไฟล์จาก `/opt/k-system-monitoring/nodered/flows.json`
4. คลิก Deploy

### 5. เริ่มต้น Services

```bash
# เปลี่ยนเป็น user ปกติ (ไม่ใช่ root)
su - yourusername

# เข้าโปรเจกต์
cd /opt/k-system-monitoring

# เริ่มต้น services ด้วย PM2
pm2 start ecosystem.config.js

# บันทึก PM2 config
pm2 save

# ตั้งให้ PM2 เริ่มต้นอัตโนมัติเมื่อ reboot
pm2 startup
```

---

## การจัดการ Services

### PM2 Commands

```bash
# ดู status ของ services
pm2 status

# ดู logs
pm2 logs

# ดู logs ของ service เฉพาะ
pm2 logs k-system-web
pm2 logs node-red

# Restart service
pm2 restart k-system-web

# Stop service
pm2 stop k-system-web

# Restart ทั้งหมด
pm2 restart all

# Stop ทั้งหมด
pm2 stop all

# ดู resource usage
pm2 monit
```

### System Services

```bash
# MySQL
sudo systemctl status mysql
sudo systemctl restart mysql
sudo systemctl stop mysql

# InfluxDB
sudo systemctl status influxdb
sudo systemctl restart influxdb

# nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo systemctl reload nginx  # reload config โดยไม่ต้อง restart
```

---

## การเข้าใช้งานระบบ

หลังจากติดตั้งเสร็จสมบูรณ์ สามารถเข้าใช้งานได้ที่:

- **🌐 Web Application**: http://your-server-ip
- **🔴 Node-RED**: http://your-server-ip/node-red
- **📊 InfluxDB UI**: http://your-server-ip:8086

---

## การอัพเดทระบบ

### วิธีที่ 1: อัพเดทจาก Git

```bash
# หยุด services
pm2 stop all

# Pull code ใหม่
cd /opt/k-system-monitoring
sudo git pull

# Install dependencies ใหม่
sudo npm install

# Build ใหม่
sudo npm run build

# เริ่มต้น services
pm2 start all
```

### วิธีที่ 2: ใช้ Script (สร้างไว้ให้สะดวก)

```bash
cd /opt/k-system-monitoring
sudo ./update-deploy.sh
```

---

## Troubleshooting

### ปัญหา: Next.js ไม่ start

```bash
# ตรวจสอบ logs
pm2 logs k-system-web

# ลอง build ใหม่
cd /opt/k-system-monitoring
npm run build
pm2 restart k-system-web
```

### ปัญหา: MySQL Connection Error

```bash
# ตรวจสอบ MySQL status
sudo systemctl status mysql

# ตรวจสอบ connection
mysql -u ksystem -p

# ตรวจสอบ .env.local
cat /opt/k-system-monitoring/.env.local
```

### ปัญหา: Node-RED ไม่เชื่อมต่อ Modbus

```bash
# ตรวจสอบ Node-RED logs
pm2 logs node-red

# Restart Node-RED
pm2 restart node-red

# ตรวจสอบว่าติดตั้ง node-red-contrib-modbus แล้ว
cd ~/.node-red
npm list | grep modbus
```

### ปัญหา: nginx 403/404 Error

```bash
# ตรวจสอบ nginx config
sudo nginx -t

# ดู nginx error log
sudo tail -f /var/log/nginx/error.log

# Reload nginx config
sudo systemctl reload nginx
```

### ปัญหา: Port ถูกใช้งานอยู่แล้ว

```bash
# ตรวจสอบว่า port ไหนกำลังถูกใช้
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :1880

# หยุด process ที่ใช้ port
sudo kill -9 [PID]
```

---

## การ Backup ข้อมูล

### Backup MySQL

```bash
# Backup database
sudo mysqldump -u ksystem -p ksystem > backup-$(date +%Y%m%d).sql

# Restore database
sudo mysql -u ksystem -p ksystem < backup-20260206.sql
```

### Backup InfluxDB

```bash
# Backup
influx backup /path/to/backup -t your-token

# Restore
influx restore /path/to/backup
```

### Backup Node-RED Flows

```bash
# Flows อยู่ที่
cp ~/.node-red/flows.json ~/backup-flows-$(date +%Y%m%d).json
```

---

## Security Best Practices

### 1. เปลี่ยน Default Passwords

```bash
# เปลี่ยน MySQL password
sudo mysql -u root -p
ALTER USER 'ksystem'@'localhost' IDENTIFIED BY 'new_secure_password';
FLUSH PRIVILEGES;
```

### 2. ตั้งค่า Firewall

```bash
# อนุญาตเฉพาะ port ที่จำเป็น
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. ใช้ HTTPS (SSL/TLS)

```bash
# ติดตั้ง Certbot
sudo apt install -y certbot python3-certbot-nginx

# ขอ SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 4. จำกัด Access Node-RED

แก้ไข `~/.node-red/settings.js`:

```javascript
adminAuth: {
    type: "credentials",
    users: [{
        username: "admin",
        password: "$2b$08$...",  // hashed password
        permissions: "*"
    }]
}
```

---

## Performance Tuning

### 1. PM2 Cluster Mode (สำหรับ production)

แก้ไข `ecosystem.config.js`:

```javascript
{
  name: 'k-system-web',
  instances: 'max',  // ใช้ทุก CPU cores
  exec_mode: 'cluster'
}
```

### 2. nginx Caching

เพิ่มใน `/etc/nginx/sites-available/k-system`:

```nginx
# Cache static files
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. MySQL Optimization

แก้ไข `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
[mysqld]
innodb_buffer_pool_size = 1G
max_connections = 200
```

---

## Monitoring และ Logs

### ดู Logs แบบ Real-time

```bash
# PM2 logs
pm2 logs --lines 100

# nginx access log
sudo tail -f /var/log/nginx/access.log

# nginx error log
sudo tail -f /var/log/nginx/error.log

# MySQL error log
sudo tail -f /var/log/mysql/error.log

# System log
sudo journalctl -f
```

### ตรวจสอบ Disk Space

```bash
df -h
du -sh /opt/k-system-monitoring
```

### ตรวจสอบ Memory

```bash
free -h
pm2 monit
```

---

## ติดต่อและการสนับสนุน

- **GitHub Issues**: https://github.com/pavinee23/monitoring/issues
- **Email**: support@k-system.com
- **Documentation**: https://github.com/pavinee23/monitoring/wiki

---

## License

MIT License - ดู [LICENSE](LICENSE) สำหรับรายละเอียด

---

**สร้างโดย K-System Team** 🚀
