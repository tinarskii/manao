@echo off
echo ============================================
echo         Installing Manao Twitch Bot...
echo ============================================
echo.

:: Check if Git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git not found. Installing Git...
    winget install -e --id Git.Git
) else (
    echo Git is already installed.
)

:: Reload PATH after Git installation
set "PATH=%ProgramFiles%\Git\cmd;%PATH%"

:: Clone the Manao repository
set /p folderName=Enter a folder name for installation (default: manao):
if "%folderName%"=="" set folderName=manao

:: Check if the folder already exists
if exist "%folderName%" (
    echo Folder %folderName% already exists. Pulling latest changes...
    cd %folderName%
    git pull
    echo.
) else (
    echo Cloning repository into %folderName%...
    git clone https://github.com/tinarskii/manao.git "%folderName%"
    cd "%folderName%"
    echo.
)

:: Check if Bun is installed
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo Bun not found. Installing Bun...
    powershell -Command "Invoke-WebRequest https://bun.sh/install.ps1 -OutFile install.ps1"
    powershell -ExecutionPolicy Bypass -File install.ps1
) else (
    echo Bun is already installed.
)

:: Reload PATH (new bun installation)
set "PATH=%USERPROFILE%\.bun\bin;%PATH%"

:: Check if Twitch CLI is installed
where twitch >nul 2>nul
if %errorlevel% neq 0 (
    echo Twitch CLI not found. Installing Twitch CLI...
    winget install -e --id Twitch.TwitchCLI
) else (
    echo Twitch CLI is already installed.
)

:: Install project dependencies
echo Installing project dependencies...
bun install

:: Run the setup script
echo.
echo Running setup script...
bun run setup.ts

echo.
echo ============================================
echo Manao Twitch Bot installed successfully!
echo You can now run the bot using:
echo.
echo bun run start
echo.
echo Or double-click the following file:
echo start-bot.bat
echo ============================================
echo.

pause
