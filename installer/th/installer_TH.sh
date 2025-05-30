#!/bin/bash

echo "============================================"
echo "        กำลังติดตั้ง Manao Twitch Bot..."
echo "============================================"
echo

# ตรวจสอบว่าติดตั้ง Git แล้วหรือไม่
if ! command -v git &> /dev/null
then
    echo "ไม่พบ Git กำลังติดตั้ง Git..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y git
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install git
    fi
else
    echo "Git ถูกติดตั้งแล้ว"
fi

# โคลน repository ของ Manao
read -r -p "ใส่ชื่อโฟลเดอร์สำหรับการติดตั้ง (ค่าเริ่มต้น: manao): " folderName
folderName=${folderName:-manao}

if [ -d "$folderName" ]; then
    echo "โฟลเดอร์ $folderName มีอยู่แล้ว กำลังดาวน์โหลดการเปลี่ยนแปลงล่าสุด..."
    cd "$folderName" || exit
    git reset --hard HEAD
    git pull origin main
else
    echo "กำลังโคลน repository ลงใน $folderName..."
    git clone https://github.com/tinarskii/manao.git "$folderName"
    cd "$folderName" || exit
fi

# ตรวจสอบว่าติดตั้ง Bun แล้วหรือไม่
if ! command -v bun &> /dev/null
then
    echo "ไม่พบ Bun กำลังติดตั้ง Bun..."
    curl -fsSL https://bun.sh/install | bash
else
    echo "Bun ถูกติดตั้งแล้ว"
fi

# ตรวจสอบว่าติดตั้ง Twitch CLI แล้วหรือไม่
if ! command -v twitch &> /dev/null
then
    echo "ไม่พบ Twitch CLI กำลังติดตั้ง Twitch CLI..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y twitch-cli
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install twitch-cli
    fi
else
    echo "Twitch CLI ถูกติดตั้งแล้ว"
fi

# ติดตั้ง dependencies ของโปรเจกต์
echo "กำลังติดตั้ง dependencies ของโปรเจกต์..."
bun install

# ถามผู้ใช้ว่าต้องการรัน setup script หรือไม่
read -r -p "คุณต้องการรัน setup script หรือไม่? (Y/n): " runSetup
if [[ "$runSetup" =~ ^[Nn]$ ]]; then
    echo "ข้าม setup script"
else
    echo "กำลังรัน setup script..."
    bun run setup
fi

echo
echo "============================================"
echo "ติดตั้ง Manao Twitch Bot สำเร็จแล้ว!"
echo "คุณสามารถรันบอทได้โดยใช้:"
echo
echo "bun run start"
echo
echo "หรือใช้คำสั่งต่อไปนี้เพื่อเริ่มต้นบอท:"
echo "./start-bot.sh"
echo "============================================"
echo

# จบสคริปต์