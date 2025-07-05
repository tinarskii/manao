@echo off
setlocal enabledelayedexpansion

echo ============================================
echo         Installing Manao Twitch Bot...
echo ============================================
echo.

:: Check if Git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git not found. Installing Git...
    winget install -e --id Git.Git
    if %errorlevel% neq 0 (
        echo Failed to install Git. Please install Git manually and try again.
        pause
        exit /b 1
    )
) else (
    echo Git is already installed.
)

:: Reload PATH after Git installation
set "PATH=%ProgramFiles%\Git\cmd;%PATH%"

:: Fetch available releases from GitHub
echo Fetching available releases...
echo.

:: Create temporary file for releases
set "tempFile=%cd%\manao_releases.txt"
powershell -Command "try { $releases = Invoke-RestMethod -Uri 'https://api.github.com/repos/tinarskii/manao/releases'; $releases | ForEach-Object { Write-Output $_.tag_name } } catch { Write-Output 'ERROR: Failed to fetch releases' }" > "%tempFile%"

:: Check if fetch was successful

echo Available versions:
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

set /p versionChoice=Select a version (1-!count!) or press Enter for latest:

if "!versionChoice!"=="" (
    set "selectedVersion=latest"
    echo Using latest version.
) else (
    if !versionChoice! geq 1 if !versionChoice! leq !count! (
        set "selectedVersion=!version%versionChoice%!"
        echo Selected version: !selectedVersion!
    ) else (
        echo Invalid selection. Using latest version.
        set "selectedVersion=latest"
    )
)

:: Clean up temp file
del "%tempFile%" 2>nul

echo.

:: Folder selection using file explorer
echo Select installation folder...
echo.

:: Create PowerShell script for folder selection
set "psScript=%cd%\folderselect.ps1"
echo Add-Type -AssemblyName System.Windows.Forms > "%psScript%"
echo $folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog >> "%psScript%"
echo $folderBrowser.Description = "Select installation folder for Manao Twitch Bot" >> "%psScript%"
echo $folderBrowser.RootFolder = [System.Environment+SpecialFolder]::Desktop >> "%psScript%"
echo $folderBrowser.ShowNewFolderButton = $true >> "%psScript%"
echo if ($folderBrowser.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { >> "%psScript%"
echo     Write-Output $folderBrowser.SelectedPath >> "%psScript%"
echo } else { >> "%psScript%"
echo     Write-Output "CANCELLED" >> "%psScript%"
echo } >> "%psScript%"

:: Execute folder selection
for /f "tokens=*" %%i in ('powershell -ExecutionPolicy Bypass -File "%psScript%"') do set "selectedPath=%%i"

:: Clean up PowerShell script
del "%psScript%" 2>nul

:: Check if user cancelled
if "%selectedPath%"=="CANCELLED" (
    echo Installation cancelled by user.
    pause
    exit /b 0
)

:: Check if selected folder ends with "manaobot" (case-insensitive)
for %%f in ("%selectedPath%") do set "folderName=%%~nxf"
echo !folderName! | findstr /i "manaobot$" >nul
if %errorlevel% equ 0 (
    echo Selected folder ends with "manaobot" - using it directly.
    set "installPath=%selectedPath%"
) else (
    set "installPath=%selectedPath%\ManaoBot"
)
echo Selected installation path: %installPath%
echo.

:: Check if the folder already exists
if exist "%installPath%" (
    echo Folder %installPath% already exists.
    set /p overwrite="Do you want to overwrite? (Y/n):"
    if /i "!overwrite!"=="n" (
        echo Installation cancelled.
        pause
        exit /b 0
    )
    echo Removing existing installation...
    rmdir /s /q "%installPath%" 2>nul
    if exist "%installPath%" (
        echo Failed to remove existing installation. Please remove manually.
        pause
        exit /b 1
    )
)

:: Create installation directory
mkdir "%installPath%" 2>nul
if not exist "%installPath%" (
    echo Failed to create installation directory.
    pause
    exit /b 1
)

:: Clone or download the repository
echo Downloading Manao Twitch Bot...
if "%selectedVersion%"=="latest" (
    echo Cloning latest version...
    git clone https://github.com/tinarskii/manao.git "%installPath%"
    if %errorlevel% neq 0 (
        echo Failed to clone repository.
        pause
        exit /b 1
    )
) else (
    echo Downloading version %selectedVersion%...
    git clone --branch "%selectedVersion%" https://github.com/tinarskii/manao.git "%installPath%"
    if %errorlevel% neq 0 (
        echo Failed to clone repository with version %selectedVersion%.
        echo Trying to clone and checkout...
        git clone https://github.com/tinarskii/manao.git "%installPath%"
        if %errorlevel% neq 0 (
            echo Failed to clone repository.
            pause
            exit /b 1
        )
        cd "%installPath%"
        git checkout "%selectedVersion%"
        if %errorlevel% neq 0 (
            echo Failed to checkout version %selectedVersion%.
            echo Continuing with default branch...
        )
    )
)

cd "%installPath%"
echo.

:: Check if Bun is installed
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo Bun not found. Installing Bun...
    powershell -Command "try { Invoke-WebRequest https://bun.sh/install.ps1 -OutFile install.ps1; Write-Output 'Downloaded' } catch { Write-Output 'ERROR' }" > "%cd%\bun_download.txt"
    powershell -ExecutionPolicy Bypass -File install.ps1
    del install.ps1 2>nul
    del "%cd%\bun_download.txt" 2>nul
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
    if %errorlevel% neq 0 (
        echo Failed to install Twitch CLI. You may need to install it manually.
        echo Continuing with installation...
    )
) else (
    echo Twitch CLI is already installed.
)

:: Install project dependencies
echo Installing project dependencies...
bun install
if %errorlevel% neq 0 (
    echo Failed to install dependencies. Please check your internet connection and try again.
    pause
    exit /b 1
)

:: Check if user wants to run setup script
set /p runSetup=Do you want to run the setup script? (Y/n):
if /i "%runSetup%"=="n" (
    echo Skipping setup script.
) else (
    echo Running setup script...
    bun setup
)

echo.
echo ============================================
echo Manao Twitch Bot installed successfully!
echo Installation location: %installPath%
echo Version: %selectedVersion%
echo.
echo You can now run the bot using:
echo.
echo bun run start
echo.
echo Or double-click the following file:
echo %installPath%\tools\START_MANAOBOT.bat
echo ============================================
echo.

:: Ask if user wants to open installation folder
set /p openFolder=Do you want to open the installation folder? (Y/n):
if /i not "%openFolder%"=="n" (
    explorer "%installPath%"
)

pause