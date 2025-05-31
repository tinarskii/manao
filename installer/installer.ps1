Write-Host "============================================"
Write-Host "        Installing Manao Twitch Bot..."
Write-Host "============================================"
Write-Host ""

# Validate environment variable
if (-not $env:INSTALL_PATH) {
    Write-Host "No install path specified. Exiting."
    exit 1
}
$folderPath = $env:INSTALL_PATH
$skipSetup = $env:SKIP_SETUP -eq "True"

# Check Git
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitInstalled) {
    Write-Host "Git not found. Installing Git..."
    winget install -e --id Git.Git
} else {
    Write-Host "Git is already installed."
}
$env:PATH = "$env:ProgramFiles\Git\cmd;" + $env:PATH

# Clone or pull repo
if (Test-Path -Path $folderPath) {
    Write-Host "Folder already exists. Pulling latest changes..."
    Set-Location -Path $folderPath
    git reset --hard HEAD
    git pull
} else {
    Write-Host "Cloning repository into $folderPath..."
    git clone https://github.com/tinarskii/manao.git $folderPath
    Set-Location -Path $folderPath
}

# Install Bun
$bunInstalled = Get-Command bun -ErrorAction SilentlyContinue
if (-not $bunInstalled) {
    Write-Host "Bun not found. Installing Bun..."
    Invoke-WebRequest -Uri "https://bun.sh/install.ps1" -OutFile "install.ps1"
    .\install.ps1
} else {
    Write-Host "Bun is already installed."
}
$env:PATH = "$env:USERPROFILE\.bun\bin;" + $env:PATH

# Install Twitch CLI
$twitchInstalled = Get-Command twitch -ErrorAction SilentlyContinue
if (-not $twitchInstalled) {
    Write-Host "Twitch CLI not found. Installing Twitch CLI..."
    winget install -e --id Twitch.TwitchCLI
} else {
    Write-Host "Twitch CLI is already installed."
}

# Install dependencies
Write-Host "Installing project dependencies..."
bun install

# Optional setup script
if ($skipSetup) {
    Write-Host "Skipping setup script as requested."
} else {
    Write-Host "Running setup script..."
    bun run setup-ui.tsx
}

# Done
Write-Host ""
Write-Host "============================================"
Write-Host "Manao Twitch Bot installed successfully!"
Write-Host "You can now run the bot using:"
Write-Host ""
Write-Host "bun run start"
Write-Host ""
Write-Host "Or double-click the following file:"
Write-Host "start-bot.bat"
Write-Host "============================================"
Write-Host ""

Read-Host -Prompt "Press Enter to exit"
