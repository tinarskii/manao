@echo off
echo ============================================
echo         กำลังติดตั้ง Manao Twitch Bot...
echo ============================================
echo.

:: ตรวจสอบว่าติดตั้ง Git แล้วหรือไม่
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ไม่พบ Git กำลังติดตั้ง Git...
    winget install -e --id Git.Git
) else (
    echo Git ถูกติดตั้งแล้ว
)

:: โหลด PATH ใหม่หลังติดตั้ง Git
set "PATH=%ProgramFiles%\Git\cmd;%PATH%"

:: โคลน repository ของ Manao
set /p folderName=ใส่ชื่อโฟลเดอร์สำหรับการติดตั้ง (ค่าเริ่มต้น: manao):
if "%folderName%"=="" set folderName=manao

:: ตรวจสอบว่าโฟลเดอร์มีอยู่แล้วหรือไม่
if exist "%folderName%" (
    echo โฟลเดอร์ %folderName% มีอยู่แล้ว กำลังดาวน์โหลดการเปลี่ยนแปลงล่าสุด...
    cd %folderName%
    git reset --hard HEAD
    git pull
    echo.
) else (
    echo กำลังโคลน repository ลงใน %folderName%...
    git clone https://github.com/tinarskii/manao.git "%folderName%"
    cd "%folderName%"
    echo.
)

:: ตรวจสอบว่าติดตั้ง Bun แล้วหรือไม่
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo ไม่พบ Bun กำลังติดตั้ง Bun...
    powershell -Command "Invoke-WebRequest https://bun.sh/install.ps1 -OutFile install.ps1"
    powershell -ExecutionPolicy Bypass -File install.ps1
) else (
    echo Bun ถูกติดตั้งแล้ว
)

:: โหลด PATH ใหม่ (การติดตั้ง bun ใหม่)
set "PATH=%USERPROFILE%\.bun\bin;%PATH%"

:: ตรวจสอบว่าติดตั้ง Twitch CLI แล้วหรือไม่
where twitch >nul 2>nul
if %errorlevel% neq 0 (
    echo ไม่พบ Twitch CLI กำลังติดตั้ง Twitch CLI...
    winget install -e --id Twitch.TwitchCLI
) else (
    echo Twitch CLI ถูกติดตั้งแล้ว
)

:: ติดตั้ง dependencies ของโปรเจกต์
echo กำลังติดตั้ง dependencies ของโปรเจกต์...
bun install

:: ถามผู้ใช้ว่าต้องการรัน setup script หรือไม่
set /p runSetup=คุณต้องการรัน setup script หรือไม่? (Y/n):
if /i "%runSetup%"=="n" or "%runSetup%"=="N" (
    echo ข้าม setup script
) else (
    echo กำลังรัน setup script...
    bun run setup
)

echo.
echo ============================================
echo ติดตั้ง Manao Twitch Bot สำเร็จแล้ว!
echo คุณสามารถรันบอทได้โดยใช้:
echo.
echo bun run start
echo.
echo หรือดับเบิลคลิกไฟล์ต่อไปนี้:
echo start-bot.bat
echo ============================================
echo.

pause