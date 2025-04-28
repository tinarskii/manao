Write-Host "============================================"
Write-Host "        Installing Manao Twitch Bot..."
Write-Host "============================================"
Write-Host ""

# Check if Git is installed
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if ($null -eq $gitInstalled) {
    Write-Host "Git not found. Installing Git..."
    winget install -e --id Git.Git
} else {
    Write-Host "Git is already installed."
}

# Reload PATH after Git installation (necessary only for PowerShell)
$env:PATH = "$env:ProgramFiles\Git\cmd;" + $env:PATH

# Prompt user for folder name to install the repository
$folderName = Read-Host "Enter a folder name for installation (default: manao)"
if (-not $folderName) {
    $folderName = "manao"
}

Write-Host "Cloning repository into $folderName..."
git clone https://github.com/tinarskii/manao.git $folderName
Set-Location -Path $folderName
Write-Host ""

# Check if Bun is installed
$bunInstalled = Get-Command bun -ErrorAction SilentlyContinue
if ($null -eq $bunInstalled) {
    Write-Host "Bun not found. Installing Bun..."
    Invoke-WebRequest -Uri "https://bun.sh/install.ps1" -OutFile "install.ps1"
    .\install.ps1
} else {
    Write-Host "Bun is already installed."
}

# Reload PATH (new bun installation)
$env:PATH = "$env:USERPROFILE\.bun\bin;" + $env:PATH

# Check if Twitch CLI is installed
$twitchInstalled = Get-Command twitch -ErrorAction SilentlyContinue
if ($null -eq $twitchInstalled) {
    Write-Host "Twitch CLI not found. Installing Twitch CLI..."
    winget install -e --id Twitch.TwitchCLI
} else {
    Write-Host "Twitch CLI is already installed."
}

# Install project dependencies
Write-Host "Installing project dependencies..."
bun install

# Run the setup script
Write-Host ""
Write-Host "Running setup script..."
bun run setup.ts

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

# Pause (optional for keeping the window open in PowerShell)
Read-Host -Prompt "Press Enter to exit"
