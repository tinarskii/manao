Write-Host "============================================"
Write-Host "        กำลังติดตั้ง Manao Twitch Bot..."
Write-Host "============================================"
Write-Host ""

# ตรวจสอบว่าติดตั้ง Git แล้วหรือไม่
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if ($null -eq $gitInstalled) {
    Write-Host "ไม่พบ Git กำลังติดตั้ง Git..."
    winget install -e --id Git.Git
} else {
    Write-Host "Git ถูกติดตั้งแล้ว"
}

# โหลด PATH ใหม่หลังติดตั้ง Git (จำเป็นสำหรับ PowerShell เท่านั้น)
$env:PATH = "$env:ProgramFiles\Git\cmd;" + $env:PATH

# ถามผู้ใช้ชื่อโฟลเดอร์สำหรับติดตั้ง repository
$folderName = Read-Host "ใส่ชื่อโฟลเดอร์สำหรับการติดตั้ง (ค่าเริ่มต้น: manao)"
if (-not $folderName) {
    $folderName = "manao"
}

$folderPath = Join-Path -Path $env:USERPROFILE -ChildPath $folderName
if (Test-Path -Path $folderPath) {
    Write-Host "โฟลเดอร์ $folderName มีอยู่แล้ว กำลังดาวน์โหลดการเปลี่ยนแปลงล่าสุด..."
    Set-Location -Path $folderPath
    git reset --hard HEAD
    git pull
} else {
    Write-Host "กำลังโคลน repository ลงใน $folderName..."
    git clone https://github.com/tinarskii/manao.git $folderName
    Set-Location -Path $folderPath
    Write-Host ""
}

# ตรวจสอบว่าติดตั้ง Bun แล้วหรือไม่
$bunInstalled = Get-Command bun -ErrorAction SilentlyContinue
if ($null -eq $bunInstalled) {
    Write-Host "ไม่พบ Bun กำลังติดตั้ง Bun..."
    Invoke-WebRequest -Uri "https://bun.sh/install.ps1" -OutFile "install.ps1"
    .\install.ps1
} else {
    Write-Host "Bun ถูกติดตั้งแล้ว"
}

# โหลด PATH ใหม่ (การติดตั้ง bun ใหม่)
$env:PATH = "$env:USERPROFILE\.bun\bin;" + $env:PATH

# ตรวจสอบว่าติดตั้ง Twitch CLI แล้วหรือไม่
$twitchInstalled = Get-Command twitch -ErrorAction SilentlyContinue
if ($null -eq $twitchInstalled) {
    Write-Host "ไม่พบ Twitch CLI กำลังติดตั้ง Twitch CLI..."
    winget install -e --id Twitch.TwitchCLI
} else {
    Write-Host "Twitch CLI ถูกติดตั้งแล้ว"
}

# ติดตั้ง dependencies ของโปรเจกต์
Write-Host "กำลังติดตั้ง dependencies ของโปรเจกต์..."
bun install

# ถามผู้ใช้ว่าต้องการรัน setup script หรือไม่
$runSetup = Read-Host "คุณต้องการรัน setup script หรือไม่? (Y/n)"
if ($runSetup -eq "N" -or $runSetup -eq "n") {
    Write-Host "ข้าม setup script"
} else {
    Write-Host "กำลังรัน setup script..."
    bun run setup.ts
}

## รัน setup script
#Write-Host ""
#Write-Host "กำลังรัน setup script..."
#bun run setup.ts

Write-Host ""
Write-Host "============================================"
Write-Host "ติดตั้ง Manao Twitch Bot สำเร็จแล้ว!"
Write-Host "คุณสามารถรันบอทได้โดยใช้:"
Write-Host ""
Write-Host "bun run start"
Write-Host ""
Write-Host "หรือดับเบิลคลิกไฟล์ต่อไปนี้:"
Write-Host "start-bot.bat"
Write-Host "============================================"
Write-Host ""

# หยุดชั่วคราว (ทางเลือกสำหรับเปิดหน้าต่างไว้ใน PowerShell)
Read-Host -Prompt "กด Enter เพื่อออก"