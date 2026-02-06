# 📦 วิธีการย้ายระบบไปยัง Server

คู่มือสำหรับการ transfer โปรเจกต์จาก Local (WSL) ไปยัง Production Server

---

## 📍 ตำแหน่งปัจจุบัน

โปรเจกต์อยู่ที่: `/home/k-system/projects/monitoring`

---

## 🎯 วิธีที่ 1: Git Clone บน Server (แนะนำที่สุด)

เหมาะสำหรับ: Server ที่มีอินเทอร์เน็ต

### ขั้นตอน:

```bash
# 1. SSH เข้า server
ssh username@your-server-ip

# 2. Clone โปรเจกต์จาก GitHub
git clone https://github.com/pavinee23/monitoring.git
cd monitoring

# 3. รัน deployment script
chmod +x server-deploy.sh
sudo ./server-deploy.sh
```

### ข้อดี:
- ✅ ง่ายที่สุด ใช้เวลาน้อย
- ✅ ได้ code version ล่าสุดจาก GitHub
- ✅ สามารถ pull update ได้ง่าย

---

## 🎯 วิธีที่ 2: SCP (Secure Copy) จาก Local

เหมาะสำหรับ: ต้องการย้ายไฟล์จาก local ที่แก้ไขแล้ว

### ขั้นตอน:

```bash
# จาก WSL/Local machine
cd /home/k-system/projects/monitoring

# Upload ทั้งโฟลเดอร์ไปยัง server
scp -r . username@your-server-ip:~/monitoring/

# SSH เข้า server
ssh username@your-server-ip

# เข้าโฟลเดอร์และรัน script
cd ~/monitoring
chmod +x server-deploy.sh
sudo ./server-deploy.sh
```

### ข้อดี:
- ✅ ใช้ได้กับ server ที่ไม่มีอินเทอร์เน็ตหรือไม่มี Git
- ✅ ย้ายไฟล์ที่แก้ไขแล้วได้ทันที

---

## 🎯 วิธีที่ 3: rsync (แนะนำสำหรับ Sync)

เหมาะสำหรับ: อัพเดทไฟล์บ่อยๆ และต้องการ sync

### ขั้นตอน:

```bash
# จาก WSL/Local machine
cd /home/k-system/projects/monitoring

# Sync โฟลเดอร์ไปยัง server (ไม่รวม node_modules, .next)
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'backup*' \
  . username@your-server-ip:~/monitoring/

# SSH เข้า server
ssh username@your-server-ip

# เข้าโฟลเดอร์และรัน script
cd ~/monitoring
chmod +x server-deploy.sh
sudo ./server-deploy.sh
```

### ข้อดี:
- ✅ Sync เฉพาะไฟล์ที่เปลี่ยน (เร็วกว่า SCP)
- ✅ Resume ได้ถ้าหลุด
- ✅ แสดง progress bar

---

## 🎯 วิธีที่ 4: Archive และ Upload

เหมาะสำหรับ: Server ที่ bandwidth จำกัด

### ขั้นตอน:

```bash
# 1. สร้าง archive บน local machine
cd /home/k-system/projects
tar -czf monitoring-deploy.tar.gz \
  --exclude='monitoring/node_modules' \
  --exclude='monitoring/.next' \
  --exclude='monitoring/backup*' \
  monitoring/

# 2. Upload archive ไปยัง server
scp monitoring-deploy.tar.gz username@your-server-ip:~/

# 3. SSH เข้า server
ssh username@your-server-ip

# 4. Extract archive
tar -xzf monitoring-deploy.tar.gz
cd monitoring

# 5. รัน deployment script
chmod +x server-deploy.sh
sudo ./server-deploy.sh

# 6. ลบ archive (optional)
rm ~/monitoring-deploy.tar.gz
```

### ข้อดี:
- ✅ ไฟล์เดียว เล็กกว่า (compressed)
- ✅ เหมาะสำหรับ network ช้า

---

## 📦 ไฟล์ที่สำคัญสำหรับ Deployment

ไฟล์ที่ **ต้อง** upload ไปยัง server:

```
monitoring/
├── server-deploy.sh          ← สำคัญที่สุด! (ติดตั้งอัตโนมัติ)
├── update-deploy.sh          ← อัพเดทระบบ
├── manage-services.sh        ← จัดการ services
├── backup.sh                 ← backup ข้อมูล
├── package.json              ← dependencies
├── package-lock.json
├── next.config.js            ← Next.js config
├── tsconfig.json
├── app/                      ← source code
├── api/                      ← API code
├── lib/                      ← libraries
├── public/                   ← static files
├── nodered/                  ← Node-RED flows
└── database/                 ← MySQL schemas
```

ไฟล์/โฟลเดอร์ที่ **ไม่ต้อง** upload:

```
node_modules/                 ← จะติดตั้งใหม่บน server
.next/                        ← จะ build ใหม่บน server
backup*/                      ← ไฟล์ backup local
.git/                         ← ถ้าใช้ git clone บน server
dist.json                     ← build artifacts
```

---

## 🔑 การตั้งค่า SSH แบบไม่ต้องใส่ Password

### สร้าง SSH Key

```bash
# บน Local machine (WSL)
ssh-keygen -t ed25519 -C "your_email@example.com"
# กด Enter ทุกครั้ง (ไม่ต้องใส่ passphrase ถ้าไม่ต้องการ)

# Copy public key ไปยัง server
ssh-copy-id username@your-server-ip

# ทดสอบ SSH (ไม่ต้องใส่ password แล้ว)
ssh username@your-server-ip
```

### ใช้ SSH Config (สะดวกยิ่งขึ้น)

```bash
# สร้าง/แก้ไข ~/.ssh/config
nano ~/.ssh/config

# เพิ่ม:
Host myserver
    HostName your-server-ip
    User username
    IdentityFile ~/.ssh/id_ed25519

# บันทึก (Ctrl+O, Enter, Ctrl+X)

# ตอนนี้ SSH ได้ง่ายๆ:
ssh myserver

# หรือ SCP:
scp -r monitoring myserver:~/
```

---

## ✅ Checklist ก่อน Transfer

ก่อนย้ายระบบ ตรวจสอบว่า:

- [ ] รู้ IP address ของ server
- [ ] มี SSH username และ password/key
- [ ] สามารถ SSH เข้า server ได้
- [ ] มี sudo/root access บน server
- [ ] Server มี internet connection (ถ้าใช้ git clone)
- [ ] เตรียม MySQL password ที่จะใช้
- [ ] เตรียม InfluxDB password ที่จะใช้
- [ ] Push code ล่าสุดไปที่ GitHub แล้ว (ถ้าใช้ git clone)

---

## 🚀 ขั้นตอนหลังการ Transfer

### 1. Verify ว่าไฟล์ครบ

```bash
# SSH เข้า server
ssh username@your-server-ip

# ตรวจสอบไฟล์
cd ~/monitoring
ls -la

# ตรวจสอบว่ามี server-deploy.sh
ls -la server-deploy.sh
```

### 2. รัน Deployment Script

```bash
chmod +x server-deploy.sh
sudo ./server-deploy.sh
```

### 3. ทำตามขั้นตอนใน Script

Script จะถาม:
- ✓ ยืนยันการติดตั้ง (กด Y)
- ✓ รอให้ติดตั้ง dependencies (10-15 นาที)
- ✓ ทำตาม post-installation instructions

### 4. Verify การติดตั้ง

```bash
# ตรวจสอบ services
cd /opt/k-system-monitoring
./manage-services.sh status

# ตรวจสอบเว็บ
curl http://localhost
```

---

## 📊 ตัวอย่างคำสั่งทั้งหมด

### สำหรับผู้ที่ต้องการ Copy-Paste

```bash
# === บน Local Machine (WSL) ===

# วิธีที่ 1: Git Clone บน Server
ssh username@your-server-ip "git clone https://github.com/pavinee23/monitoring.git && cd monitoring && chmod +x server-deploy.sh"

# วิธีที่ 2: SCP ทั้งโฟลเดอร์
cd /home/k-system/projects
scp -r monitoring username@your-server-ip:~/

# วิธีที่ 3: rsync
cd /home/k-system/projects/monitoring
rsync -avz --progress --exclude 'node_modules' --exclude '.next' . username@your-server-ip:~/monitoring/

# วิธีที่ 4: Archive
cd /home/k-system/projects
tar -czf monitoring.tar.gz --exclude='monitoring/node_modules' --exclude='monitoring/.next' monitoring/
scp monitoring.tar.gz username@your-server-ip:~/

# === บน Server ===

# ถ้าใช้ Archive (วิธีที่ 4)
tar -xzf monitoring.tar.gz

# เข้าโฟลเดอร์
cd monitoring  # หรือ ~/monitoring ตามที่ upload

# รัน deployment
chmod +x server-deploy.sh
sudo ./server-deploy.sh

# หลังติดตั้งเสร็จ: Setup InfluxDB
influx setup

# แก้ไข .env.local
sudo nano /opt/k-system-monitoring/.env.local

# เริ่มต้น services
cd /opt/k-system-monitoring
pm2 start ecosystem.config.js
pm2 save

# ตรวจสอบ
./manage-services.sh status
```

---

## ❓ FAQ

### Q: ควรใช้วิธีไหน?

**A:** แนะนำวิธีที่ 1 (Git Clone) - ง่ายและรวดเร็วที่สุด

### Q: ถ้า server ไม่มี internet ละ?

**A:** ใช้วิธีที่ 2 (SCP) หรือวิธีที่ 4 (Archive)

### Q: ต้อง transfer node_modules ด้วยไหม?

**A:** ไม่ต้อง - deployment script จะติดตั้งใหม่อัตโนมัติ

### Q: ถ้า transfer ไปแล้วมี error?

**A:** ดู logs:
```bash
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

### Q: อัพเดทยังไง?

**A:** ใช้ `./update-deploy.sh` หรือ:
```bash
git pull
npm install
npm run build
pm2 restart all
```

---

## 📞 ต้องการความช่วยเหลือ?

อ่านคู่มือเพิ่มเติม:

- **Quick Setup**: [QUICK-SERVER-SETUP.md](QUICK-SERVER-SETUP.md)
- **Full Guide**: [SERVER-DEPLOYMENT-GUIDE.md](SERVER-DEPLOYMENT-GUIDE.md)
- **Original README**: [README.md](README.md)

---

**สร้างโดย K-System Team** 🚀
**Last Updated**: 2026-02-06
