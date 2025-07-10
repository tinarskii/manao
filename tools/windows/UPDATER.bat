@echo off
setlocal enabledelayedexpansion

echo Please select your Manao installation directory...

:: Use PowerShell to prompt for folder selection
set "psCommand=Add-Type -AssemblyName System.Windows.Forms; $f = New-Object Windows.Forms.FolderBrowserDialog; if ($f.ShowDialog() -eq 'OK') { Write-Output $f.SelectedPath }"
for /f "delims=" %%i in ('powershell -NoProfile -Command "%psCommand%"') do set "installPath=%%i"

if "%installPath%"=="" (
    echo No folder selected. Exiting.
    pause
    exit /b 1
)

:: Change to selected directory
cd /d "%installPath%"
if errorlevel 1 (
    echo Failed to access the selected directory.
    pause
    exit /b 1
)

echo.
echo ============================================
echo         Updating Manao Twitch Bot...
echo ============================================
echo.
echo Selected folder: %cd%

:: Check if this is actually a Manao project (package.json exists)
if not exist "package.json" (
    echo ERROR: This does not appear to be a Manao Twitch Bot installation.
    echo Please select the correct directory containing the Manao project.
    pause
    exit /b 1
)

:: Get current directory (installation path)
set "installPath=%cd%"
echo Current installation: %installPath%

:: Check if Git is available
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git not found. Please install Git to use the updater.
    pause
    exit /b 1
)

:: Check if we're in a Git repository
if not exist ".git" (
    echo ERROR: This is not a Git repository.
    echo The updater requires a Git-based installation.
    echo Please use the installer to reinstall Manao.
    pause
    exit /b 1
)

:: Get current version/branch
for /f "tokens=*" %%i in ('git describe --tags --exact-match 2^>nul') do set "currentVersion=%%i"
if "!currentVersion!"=="" (
    for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "currentBranch=%%i"
    if "!currentBranch!"=="" (
        set "currentVersion=Unknown"
    ) else (
        set "currentVersion=!currentBranch! (branch)"
    )
)

echo Current version: !currentVersion!
echo.

:: Fetch latest information from remote
echo Fetching latest updates...
git fetch --tags 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Failed to fetch latest updates. Continuing with local information.
)

:: Fetch available releases from GitHub
echo Fetching available releases...
echo.

:: Create temporary file for releases
set "tempFile=%temp%\manao_releases_update.txt"
powershell -Command "try { $releases = Invoke-RestMethod -Uri 'https://api.github.com/repos/tinarskii/manao/releases'; $releases | ForEach-Object { Write-Output $_.tag_name } } catch { Write-Output 'ERROR: Failed to fetch releases' }" > "%tempFile%"


echo Available versions:
echo 0. Latest (git pull)
echo.
set /a count=0
for /f "tokens=*" %%i in (%tempFile%) do (
    set /a count+=1
    echo !count!. %%i
    set "version!count!=%%i"
)
echo.
echo !count! versions found.
echo.

set /p versionChoice=Select a version (0-!count!) or press Enter for latest:

if "!versionChoice!"=="" (
    set "selectedVersion=latest"
    echo Updating to latest version.
) else if "!versionChoice!"=="0" (
    set "selectedVersion=latest"
    echo Updating to latest version.
) else (
    if !versionChoice! geq 1 if !versionChoice! leq !count! (
        set "selectedVersion=!version%versionChoice%!"
        echo Selected version: !selectedVersion!
    ) else (
        echo Invalid selection. Updating to latest version.
        set "selectedVersion=latest"
    )
)


:: Clean up temp file
del "%tempFile%" 2>nul

echo.

:: Backup .env* files and other important files
set "backupDir=%temp%\manao_update_backup_%random%"
mkdir "%backupDir%" 2>nul
echo Backing up configuration files...

:: Backup .env* files
for %%f in (".env*") do (
    if exist "%%f" (
        echo Backing up %%~nxf...
        copy "%%f" "%backupDir%\" >nul 2>nul
    )
)

:: Backup database files
if exist "bot-data.sqlite" (
    echo Backing up bot data...
    copy "bot-data.sqlite" "%backupDir%\" >nul 2>nul
)

:: Backup any custom files the user might have added
for %%f in ("*.local.*" "*.custom.*") do (
    if exist "%%f" (
        echo Backing up %%~nxf...
        copy "%%f" "%backupDir%\" >nul 2>nul
    )
)

echo Configuration files backed up.
echo.

:: Perform the update
echo Updating Manao Twitch Bot...
if "%selectedVersion%"=="latest" (
    echo Pulling latest changes...
    git reset --hard HEAD >nul 2>nul
    git pull origin main >nul 2>nul
    if %errorlevel% neq 0 (
        echo Failed to pull latest changes.
        goto :restore_and_exit
    )
) else (
    echo Updating to version %selectedVersion%...
    git reset --hard HEAD >nul 2>nul
    git checkout "%selectedVersion%"
    if %errorlevel% neq 0 (
        echo Failed to checkout version %selectedVersion%.
        echo Trying to fetch and checkout...
        git fetch --tags >nul 2>nul
        git checkout "%selectedVersion%"
        if %errorlevel% neq 0 (
            echo Failed to update to version %selectedVersion%.
            goto :restore_and_exit
        )
    )
)

echo.
echo Update completed successfully!
echo.

:: Check if Bun is available
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Bun not found. Please install Bun to install dependencies.
    echo You can install Bun from: https://bun.sh
    goto :restore_files
)

:: Update dependencies
echo Installing/updating dependencies...
bun install
if %errorlevel% neq 0 (
    echo WARNING: Failed to install dependencies.
    echo You may need to run 'bun install' manually.
)

:restore_files
:: Restore backed up files
echo.
echo Restoring configuration files...
for %%f in ("%backupDir%\*") do (
    if exist "%%f" (
        echo Restoring %%~nxf...
        copy "%%f" "." >nul 2>nul
    )
)

:: Clean up backup directory
rmdir /s /q "%backupDir%" 2>nul

:: Get new version info
for /f "tokens=*" %%i in ('git describe --tags --exact-match 2^>nul') do set "newVersion=%%i"
if "!newVersion!"=="" (
    for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "newBranch=%%i"
    if "!newBranch!"=="" (
        set "newVersion=Unknown"
    ) else (
        set "newVersion=!newBranch! (branch)"
    )
)

echo Configuration files restored successfully.
echo.
echo ============================================
echo Manao Twitch Bot updated successfully!
echo.
echo Previous version: !currentVersion!
echo Current version:  !newVersion!
echo.
echo You can now run the bot using:
echo bun run start
echo.
echo Or double-click (in folder "tools/windows"): START_MANAO.bat
echo ============================================
echo.
pause
exit /b 0

:restore_and_exit
echo.
echo Update failed. Restoring configuration files...
for %%f in ("%backupDir%\*") do (
    if exist "%%f" (
        echo Restoring %%~nxf...
        copy "%%f" "." >nul 2>nul
    )
)
rmdir /s /q "%backupDir%" 2>nul
echo.
echo Configuration files restored.
echo Please check your internet connection and try again.
pause
exit /b 1