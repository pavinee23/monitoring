# ⚡ Quick Server Setup Guide

คู่มือรวดเร็วสำหรับย้ายระบบไปยัง Production Server

---

## 🎯 วิธีที่ 1: ติดตั้งอัตโนมัติด้วย Script (แนะนำ)

### ขั้นตอนที่ 1: เข้า Server

```bash
ssh username@your-server-ip
```

### ขั้นตอนที่ 2: Clone และรัน Script

```bash
# Clone โปรเจกต์
git clone https://github.com/pavinee23/monitoring.git
cd monitoring

# รัน deployment script
chmod +x server-deploy.sh
sudo ./server-deploy.sh
```

### ขั้นตอนที่ 3: Setup InfluxDB

```bash
influx setup
# - Organization: k-system
# - Bucket: monitoring
# - จดบันทึก Token ที่ได้
```

### ขั้นตอนที่ 4: แก้ไข Environment Variables

```bash
sudo nano /opt/k-system-monitoring/.env.local
# แก้ไข INFLUXDB_TOKEN
```

### ขั้นตอนที่ 5: เริ่มต้น Services

```bash
cd /opt/k-system-monitoring
pm2 start ecosystem.config.js
pm2 save
```

### ✅ เสร็จสิ้น!

เข้าใช้งานได้ที่: `http://your-server-ip`

---

## 🎯 วิธีที่ 2: ติดตั้งจาก Local Machine

### ขั้นตอนที่ 1: Upload ไฟล์ไปยัง Server

```bash
# จาก local machine (WSL/Linux)
cd ~/projects/monitoring

# Upload deployment script
scp server-deploy.sh username@your-server-ip:~/

# หรือ upload ทั้งโฟลเดอร์
scp -r . username@your-server-ip:~/monitoring/
```

### ขั้นตอนที่ 2: SSH เข้า Server และรัน Script

```bash
# SSH เข้า server
ssh username@your-server-ip

# รัน deployment script
chmod +x server-deploy.sh
sudo ./server-deploy.sh
```

### ขั้นตอนที่ 3-5: ทำตามขั้นตอนเดียวกับวิธีที่ 1

---

## 📦 การใช้งาน Scripts

### 1. การจัดการ Services

```bash
# แสดงสถานะ services
./manage-services.sh status

# เริ่มต้น services
./manage-services.sh start

# หยุด services
./manage-services.sh stop

# Restart services
./manage-services.sh restart

# ดู logs
./manage-services.sh logs
```

### 2. การอัพเดทระบบ

```bash
# อัพเดทจาก Git และ restart services
./update-deploy.sh
```

### 3. การ Backup ข้อมูล

```bash
# Backup ทั้งหมด (MySQL, InfluxDB, Node-RED, Project files)
./backup.sh
```

---

## 🔑 SSH และ Credentials ที่ต้องเตรียม

### 1. ข้อมูล Server

```
Server IP: _________________
SSH Username: _________________
SSH Password/Key: _________________
```

### 2. Database Passwords

```
MySQL Root Password: _________________
MySQL User (ksystem) Password: _________________
InfluxDB Admin Password: _________________
InfluxDB Token: _________________
```

### 3. ตั้งค่า SSH Key (แนะนำ)

```bash
# สร้าง SSH key บน local machine
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key ไปยัง server
ssh-copy-id username@your-server-ip

# ทดสอบ SSH โดยไม่ต้องใส่ password
ssh username@your-server-ip
```

---

## 🚀 URL และ Ports ที่ใช้งาน

หลังติดตั้งเสร็จ สามารถเข้าใช้งานได้ที่:

| Service | URL | Port |
|---------|-----|------|
| **Web Application** | http://your-server-ip | 80 |
| **Node-RED** | http://your-server-ip/node-red | 1880 (internal) |
| **InfluxDB UI** | http://your-server-ip:8086 | 8086 |
| **MySQL** | localhost | 3306 |

---

## 📋 Pre-Installation Checklist

ก่อนเริ่มติดตั้ง ตรวจสอบว่า:

- [ ] มี Server พร้อมใช้งาน (Ubuntu 20.04+ หรือ Debian 11+)
- [ ] สามารถ SSH เข้า Server ได้
- [ ] Server มี RAM อย่างน้อย 4GB
- [ ] Server มี Disk Space ว่างอย่างน้อย 20GB
- [ ] Server เชื่อมต่ออินเทอร์เน็ตได้
- [ ] มี sudo/root access บน Server
- [ ] เตรียม passwords ที่จะใช้งาน

---

## 🔧 Post-Installation Tasks

หลังติดตั้งเสร็จ ควรทำ:

### 1. ตั้งค่า Firewall

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. ตั้งค่า SSL/HTTPS (ถ้ามี domain)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. ตั้งค่า Node-RED Authentication

```bash
# สร้าง password hash
node-red admin hash-pw

# แก้ไข ~/.node-red/settings.js
nano ~/.node-red/settings.js
# เพิ่ม adminAuth configuration
```

### 4. Import Node-RED Flows

1. เข้า http://your-server-ip/node-red
2. Menu → Import
3. เลือกไฟล์ `nodered/flows.json`
4. Deploy

### 5. Import MySQL Schema

```bash
# ถ้ามีไฟล์ schema
sudo mysql -u ksystem -p ksystem < database/schema.sql

# หรือ restore จาก backup
sudo mysql -u ksystem -p ksystem < backup.sql
```

### 6. ทดสอบระบบ

```bash
# ตรวจสอบ services
./manage-services.sh status

# ดู logs
pm2 logs

# ทดสอบเว็บ
curl http://localhost
```

---

## 🆘 Quick Troubleshooting

### ปัญหาที่พบบ่อย:

#### 1. Port ถูกใช้งานแล้ว

```bash
# ดู process ที่ใช้ port
sudo netstat -tlnp | grep :3001

# Kill process
sudo kill -9 [PID]
```

#### 2. Permission Denied

```bash
# เปลี่ยน ownership
sudo chown -R yourusername:yourusername /opt/k-system-monitoring

# หรือรัน script ด้วย sudo
sudo ./script.sh
```

#### 3. PM2 ไม่ start

```bash
# Restart PM2
pm2 kill
pm2 start ecosystem.config.js
```

#### 4. nginx 502 Bad Gateway

```bash
# ตรวจสอบว่า Next.js running หรือไม่
pm2 status

# Restart services
pm2 restart all
sudo systemctl restart nginx
```

#### 5. MySQL Connection Error

```bash
# ตรวจสอบ MySQL status
sudo systemctl status mysql

# ตรวจสอบ credentials
cat .env.local

# ทดสอบ connection
mysql -u ksystem -p
```

---

## 📞 ติดต่อและช่วยเหลือ

หากมีปัญหาหรือข้อสงสัย:

1. **ดู Logs**:
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/error.log
   ```

2. **ตรวจสอบ GitHub Issues**:
   https://github.com/pavinee23/monitoring/issues

3. **อ่านคู่มือเพิ่มเติม**:
   - [SERVER-DEPLOYMENT-GUIDE.md](SERVER-DEPLOYMENT-GUIDE.md)
   - [README.md](README.md)

---

## 📝 คำสั่งที่ใช้บ่อย

```bash
# Service Management
pm2 status                    # ดูสถานะ services
pm2 logs                      # ดู logs ทั้งหมด
pm2 restart all               # Restart ทั้งหมด
pm2 monit                     # Monitor resource usage

# System Services
sudo systemctl restart mysql  # Restart MySQL
sudo systemctl restart nginx  # Restart nginx
sudo systemctl status influxdb # ดูสถานะ InfluxDB

# Backup
./backup.sh                   # Backup ทั้งหมด

# Update
./update-deploy.sh            # อัพเดทระบบ
git pull                      # Pull code ใหม่

# Logs
tail -f logs/app.log          # ดู application logs
sudo journalctl -f            # ดู system logs
```

---

**🚀 พร้อมใช้งานแล้ว! Good luck!**
