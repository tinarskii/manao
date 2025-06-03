Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Create the form with modern styling
$form = New-Object System.Windows.Forms.Form
$form.Text = "Manao Bot Installer"
$form.Size = New-Object System.Drawing.Size(900, 700)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(240, 240, 245)
$form.Font = New-Object System.Drawing.Font("Segoe UI", 9)

# Create main panel with padding
$mainPanel = New-Object System.Windows.Forms.Panel
$mainPanel.Dock = "Fill"
$mainPanel.Padding = New-Object System.Windows.Forms.Padding(20)
$form.Controls.Add($mainPanel)

# Create header panel
$headerPanel = New-Object System.Windows.Forms.Panel
$headerPanel.Height = 100
$headerPanel.Dock = "Top"
$headerPanel.BackColor = [System.Drawing.Color]::FromArgb(70, 130, 180)
$mainPanel.Controls.Add($headerPanel)

# Title label
$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text = "MANAO BOT INSTALLER"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::White
$titleLabel.AutoSize = $true
$titleLabel.Location = New-Object System.Drawing.Point(25, 25)
$headerPanel.Controls.Add($titleLabel)

# Subtitle label
$subtitleLabel = New-Object System.Windows.Forms.Label
$subtitleLabel.Text = "Your all-in-one Twitch bot for music, overlays, soundboards, and custom commands"
$subtitleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$subtitleLabel.ForeColor = [System.Drawing.Color]::FromArgb(230, 230, 230)
$subtitleLabel.AutoSize = $true
$subtitleLabel.Location = New-Object System.Drawing.Point(25, 60)
$headerPanel.Controls.Add($subtitleLabel)

# Create content panel
$contentPanel = New-Object System.Windows.Forms.Panel
$contentPanel.Dock = "Fill"
$contentPanel.Padding = New-Object System.Windows.Forms.Padding(0, 20, 0, 0)
$mainPanel.Controls.Add($contentPanel)

# Create button panel FIRST (so it's at the bottom)
$buttonPanel = New-Object System.Windows.Forms.Panel
$buttonPanel.Height = 80
$buttonPanel.Dock = "Bottom"
$buttonPanel.Padding = New-Object System.Windows.Forms.Padding(20, 15, 20, 15)
$contentPanel.Controls.Add($buttonPanel)

# Create log box to fill remaining space
$logBox = New-Object System.Windows.Forms.RichTextBox
$logBox.Dock = "Fill"
$logBox.ReadOnly = $true
$logBox.BackColor = [System.Drawing.Color]::White
$logBox.BorderStyle = "None"
$logBox.Font = New-Object System.Drawing.Font("Consolas", 10)
$contentPanel.Controls.Add($logBox)
$contentPanel.Controls.SetChildIndex($logBox, 1)

# Create checkbox with modern styling
$skipSetupCheckbox = New-Object System.Windows.Forms.CheckBox
$skipSetupCheckbox.Text = "Skip running setup.tsx"
$skipSetupCheckbox.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$skipSetupCheckbox.AutoSize = $true
$skipSetupCheckbox.Location = New-Object System.Drawing.Point(20, 25)
$skipSetupCheckbox.ForeColor = [System.Drawing.Color]::FromArgb(60, 60, 60)
$optionsPanel.Controls.Add($skipSetupCheckbox)

# Create log panel (fills remaining space)
$logPanel = New-Object System.Windows.Forms.Panel
$logPanel.Dock = "Fill"
$logPanel.Padding = New-Object System.Windows.Forms.Padding(20, 10, 20, 10)
$contentPanel.Controls.Add($logPanel)

# Log label
$logLabel = New-Object System.Windows.Forms.Label
$logLabel.Text = "Installation Progress"
$logLabel.Font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$logLabel.ForeColor = [System.Drawing.Color]::FromArgb(60, 60, 60)
$logLabel.Height = 25
$logLabel.Dock = "Top"
$logPanel.Controls.Add($logLabel)

# Create the log box with modern styling
$logBox = New-Object System.Windows.Forms.TextBox
$logBox.Multiline = $true
$logBox.ScrollBars = "Vertical"
$logBox.ReadOnly = $true
$logBox.WordWrap = $true
$logBox.Font = New-Object System.Drawing.Font("Consolas", 9)
$logBox.Dock = "Fill"
$logBox.BackColor = [System.Drawing.Color]::FromArgb(248, 249, 250)
$logBox.ForeColor = [System.Drawing.Color]::FromArgb(40, 40, 40)
$logBox.BorderStyle = "FixedSingle"
$logBox.Text = "Ready to install Manao Bot! Click the Install button to begin.`r`n"
$logPanel.Controls.Add($logBox)

# Create the Install button with gradient effect
$btnInstall = New-Object System.Windows.Forms.Button
$btnInstall.Text = "START INSTALLATION"
$btnInstall.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$btnInstall.Height = 50
$btnInstall.Dock = "Fill"
$btnInstall.BackColor = [System.Drawing.Color]::FromArgb(70, 130, 180)
$btnInstall.ForeColor = [System.Drawing.Color]::White
$btnInstall.FlatStyle = "Flat"
$btnInstall.FlatAppearance.BorderSize = 0
$btnInstall.Cursor = "Hand"
$buttonPanel.Controls.Add($btnInstall)

# Add hover effects to the button
$btnInstall.Add_MouseEnter({
    $btnInstall.BackColor = [System.Drawing.Color]::FromArgb(90, 150, 200)
})

$btnInstall.Add_MouseLeave({
    $btnInstall.BackColor = [System.Drawing.Color]::FromArgb(70, 130, 180)
})

# Folder browser dialog with current directory as default
$folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
$folderBrowser.Description = "Select installation directory for Manao Bot"
$folderBrowser.ShowNewFolderButton = $true
$folderBrowser.SelectedPath = Get-Location  # Set default to current directory

# Enhanced logging function with timestamps and status indicators
function Write-Log {
    param($message, $type = "info")

    $timestamp = Get-Date -Format "HH:mm:ss"
    $prefix = switch ($type) {
        "success" { "[OK]" }
        "warning" { "[WARN]" }
        "error" { "[ERROR]" }
        "info" { "[INFO]" }
        default { "[LOG]" }
    }

    $formattedMessage = "[$timestamp] $prefix $message"
    $logBox.AppendText("$formattedMessage`r`n")
    $logBox.SelectionStart = $logBox.Text.Length
    $logBox.ScrollToCaret()
    $logBox.Refresh()
    [System.Windows.Forms.Application]::DoEvents()
}

# Enhanced button click logic
$btnInstall.Add_Click({
    $btnInstall.Enabled = $false
    $btnInstall.Text = "INSTALLING..."
    $btnInstall.BackColor = [System.Drawing.Color]::FromArgb(150, 150, 150)

    try {
        $result = $folderBrowser.ShowDialog()
        if ($result -ne [System.Windows.Forms.DialogResult]::OK) {
            Write-Log "Installation cancelled by user." "warning"
            return
        }

        $installBase = $folderBrowser.SelectedPath

        # If the selected folder already ends with "manao" or "manaobot", don't append "ManaoBot"
        if ($installBase -match "\\(manao(bot)?)$") {
            $installPath = $installBase
        } else {
            $installPath = Join-Path $installBase "ManaoBot"
        }
        Write-Log "Installing to: $installPath" "info"

        # Git check
        Write-Log "Checking for Git installation..." "info"
        if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
            Write-Log "Git not found. Installing Git via winget..." "warning"
            winget install -e --id Git.Git --accept-source-agreements --accept-package-agreements
            Write-Log "Git installation completed!" "success"
        } else {
            Write-Log "Git is already installed." "success"
        }

        $env:PATH = "$env:ProgramFiles\Git\cmd;" + $env:PATH

        # Repository management
        if (-not (Test-Path $installPath)) {
            Write-Log "Cloning repository into $installPath..." "info"
            git clone https://github.com/tinarskii/manao.git $installPath 2>&1 | ForEach-Object { Write-Log $_ }
            Write-Log "Repository cloned successfully!" "success"
        } else {
            Write-Log "Folder already exists. Pulling latest changes..." "warning"
            Set-Location $installPath
            git reset --hard HEAD 2>&1 | ForEach-Object { Write-Log $_ }
            git pull 2>&1 | ForEach-Object { Write-Log $_ }
            Write-Log "Repository updated successfully!" "success"
        }

        Set-Location $installPath

        # Bun installation
        Write-Log "Checking for Bun runtime..." "info"
        if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
            Write-Log "Bun not found. Installing Bun..." "warning"
            Invoke-WebRequest -Uri "https://bun.sh/install.ps1" -OutFile "install.ps1"
            & .\install.ps1
            Write-Log "Bun installation completed!" "success"
        } else {
            Write-Log "Bun is already installed." "success"
        }

        $env:PATH = "$env:USERPROFILE\.bun\bin;" + $env:PATH

        # Twitch CLI installation
        Write-Log "Checking for Twitch CLI..." "info"
        if (-not (Get-Command twitch -ErrorAction SilentlyContinue)) {
            Write-Log "Twitch CLI not found. Installing via winget..." "warning"
            winget install -e --id Twitch.TwitchCLI --accept-source-agreements --accept-package-agreements
            Write-Log "Twitch CLI installation completed!" "success"
        } else {
            Write-Log "Twitch CLI is already installed." "success"
        }

        # Dependencies installation
        Write-Log "Installing project dependencies..." "info"
        bun install 2>&1 | ForEach-Object { Write-Log $_ }
        Write-Log "Dependencies installed successfully!" "success"

        # Setup script execution
        if (-not $skipSetupCheckbox.Checked) {
            Write-Log "Opening setup script in new terminal..." "info"
            Write-Log "Please complete the setup in the new terminal window." "info"

            # Open setup script in new terminal window
            Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$installPath'; bun run setup-ui.ts; Write-Host ''; Write-Host 'Setup completed! You can close this window.' -ForegroundColor Green; Write-Host 'Press any key to continue...'; Read-Host"

            Write-Log "Setup script launched in new terminal." "success"
        } else {
            Write-Log "Setup script skipped as requested." "warning"
        }

        # Final success message
        Write-Log "" "info"
        Write-Log "============================================================" "success"
        Write-Log "MANAO BOT INSTALLED SUCCESSFULLY!" "success"
        Write-Log "" "info"
        Write-Log "Installation location: $installPath" "info"
        Write-Log "" "info"
        Write-Log "To run the bot:" "info"
        Write-Log "  * Command line: bun run start" "info"
        Write-Log "  * Or double-click: start-bot.bat" "info"
        Write-Log "" "info"
        Write-Log "============================================================" "success"

        $btnInstall.Text = "INSTALLATION COMPLETE!"
        $btnInstall.BackColor = [System.Drawing.Color]::FromArgb(60, 179, 113)

    } catch {
        Write-Log "Installation failed: $($_.Exception.Message)" "error"
        $btnInstall.Text = "INSTALLATION FAILED"
        $btnInstall.BackColor = [System.Drawing.Color]::FromArgb(220, 53, 69)
        $btnInstall.Enabled = $true
    }
})

# Show the form
Write-Host "Starting Manao Bot Installer UI..." -ForegroundColor Cyan
[void]$form.ShowDialog()