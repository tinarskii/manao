#!/bin/bash

# Manao Twitch Bot Installer for Linux/macOS
# Make executable with: chmod +x installer.sh

set -e  # Exit on any error

echo "============================================"
echo "         Installing Manao Twitch Bot..."
echo "============================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

# Check if Git is installed
if ! command -v git &> /dev/null; then
    print_error "Git not found. Please install Git first."
    echo "On Ubuntu/Debian: sudo apt update && sudo apt install git"
    echo "On macOS: brew install git (requires Homebrew)"
    echo "On CentOS/RHEL: sudo yum install git"
    exit 1
else
    print_success "Git is already installed."
fi

# Fetch available releases from GitHub
echo "Fetching available releases..."
echo

# Create temporary file for releases
temp_file=$(mktemp)
if curl -s "https://api.github.com/repos/tinarskii/manao/releases" | grep -o '"tag_name": *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' > "$temp_file" 2>/dev/null; then
    if [ -s "$temp_file" ]; then
        echo "Available versions:"
        echo
        count=0
        while IFS= read -r version; do
            count=$((count + 1))
            echo "$count. $version"
            eval "version$count='$version'"
        done < "$temp_file"
        echo
        echo "$count versions found."
        echo

        echo -n "Select a version (1-$count) or press Enter for latest: "
        read -r version_choice

        if [ -z "$version_choice" ]; then
            selected_version="latest"
            echo "Using latest version."
        elif [ "$version_choice" -ge 1 ] && [ "$version_choice" -le "$count" ] 2>/dev/null; then
            eval "selected_version=\$version$version_choice"
            echo "Selected version: $selected_version"
        else
            echo "Invalid selection. Using latest version."
            selected_version="latest"
        fi
    else
        print_warning "No releases found. Using latest version."
        selected_version="latest"
    fi
else
    print_warning "Failed to fetch releases from GitHub. Using latest version."
    selected_version="latest"
fi

# Clean up temp file
rm -f "$temp_file"

echo

# Folder selection
echo "Select installation folder..."
echo "Current directory: $(pwd)"
echo
echo "1. Install in current directory"
echo "2. Install in ~/ManaoBot"
echo "3. Install in /opt/ManaoBot (requires sudo)"
echo "4. Enter custom path"
echo

echo -n "Select option (1-4): "
read -r folder_choice

case $folder_choice in
    1)
        selected_path="$(pwd)"
        ;;
    2)
        selected_path="$HOME/ManaoBot"
        ;;
    3)
        selected_path="/opt/ManaoBot"
        ;;
    4)
        echo -n "Enter custom path: "
        read -r custom_path
        selected_path="$custom_path"
        ;;
    *)
        echo "Invalid selection. Using current directory."
        selected_path="$(pwd)"
        ;;
esac

# Check if selected folder ends with "manaobot" (case-insensitive)
folder_name=$(basename "$selected_path")
if echo "$folder_name" | grep -qi "manaobot$"; then
    echo "Selected folder ends with 'manaobot' - using it directly."
    install_path="$selected_path"
else
    install_path="$selected_path/ManaoBot"
fi

echo "Selected installation path: $install_path"
echo

# Check if the folder already exists
if [ -d "$install_path" ]; then
    echo "Folder $install_path already exists."
    echo -n "Do you want to overwrite? (Y/n): "
    read -r overwrite
    if [[ "$overwrite" =~ ^[Nn]$ ]]; then
        echo "Installation cancelled."
        exit 0
    fi

    # Backup .env* files
    backup_dir=$(mktemp -d)
    echo "Backing up .env files..."

    # Backup bot-data.sqlite if it exists
    if [ -f "$install_path/bot-data.sqlite" ]; then
        echo "Backing up bot-data.sqlite..."
        cp "$install_path/bot-data.sqlite" "$backup_dir/"
    fi

    # Copy all .env* files to backup directory
    if ls "$install_path"/.env* 1> /dev/null 2>&1; then
        for env_file in "$install_path"/.env*; do
            if [ -f "$env_file" ]; then
                echo "Backing up $(basename "$env_file")..."
                cp "$env_file" "$backup_dir/"
            fi
        done
    fi

    # Backup config files
    for config_file in "$install_path/config.json" "$install_path/settings.json"; do
        if [ -f "$config_file" ]; then
            echo "Backing up $(basename "$config_file")..."
            cp "$config_file" "$backup_dir/"
        fi
    done

    echo "Removing existing installation..."
    rm -rf "$install_path"
    if [ -d "$install_path" ]; then
        print_error "Failed to remove existing installation. Please remove manually."
        rm -rf "$backup_dir"
        exit 1
    fi

    # Create installation directory
    mkdir -p "$install_path"
    if [ ! -d "$install_path" ]; then
        print_error "Failed to create installation directory."
        rm -rf "$backup_dir"
        exit 1
    fi
fi

# Create installation directory if it doesn't exist
if [ ! -d "$install_path" ]; then
    mkdir -p "$install_path"
    if [ ! -d "$install_path" ]; then
        print_error "Failed to create installation directory."
        exit 1
    fi
fi

# Clone or download the repository
echo "Downloading Manao Twitch Bot..."
if [ "$selected_version" = "latest" ]; then
    echo "Cloning latest version..."
    git clone https://github.com/tinarskii/manao.git "$install_path"
    if [ $? -ne 0 ]; then
        print_error "Failed to clone repository."
        exit 1
    fi
else
    echo "Downloading version $selected_version..."
    if git clone --branch "$selected_version" https://github.com/tinarskii/manao.git "$install_path"; then
        echo "Successfully cloned version $selected_version"
    else
        echo "Failed to clone with version $selected_version. Trying to clone and checkout..."
        git clone https://github.com/tinarskii/manao.git "$install_path"
        if [ $? -ne 0 ]; then
            print_error "Failed to clone repository."
            exit 1
        fi
        cd "$install_path"
        git checkout "$selected_version"
        if [ $? -ne 0 ]; then
            print_warning "Failed to checkout version $selected_version. Continuing with default branch..."
        fi
    fi
fi

cd "$install_path"
echo

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "Bun not found. Installing Bun..."
    if command -v curl &> /dev/null; then
        curl -fsSL https://bun.sh/install | bash
        # Source the shell profile to update PATH
        if [ -f "$HOME/.bashrc" ]; then
            # shellcheck source=/dev/null
            source "$HOME/.bashrc"
        elif [ -f "$HOME/.zshrc" ]; then
            # shellcheck source=/dev/null
            source "$HOME/.zshrc"
        fi
        # Update PATH for current session
        export PATH="$HOME/.bun/bin:$PATH"
    else
        print_error "curl not found. Please install curl first, then install Bun manually."
        echo "Visit: https://bun.sh"
        exit 1
    fi
else
    print_success "Bun is already installed."
fi

# Check if Twitch CLI is installed
if ! command -v twitch &> /dev/null; then
    echo "Twitch CLI not found. Please install it manually."
    echo "Visit: https://github.com/twitchdev/twitch-cli"
    print_warning "Twitch CLI installation skipped. You can install it later if needed."
else
    print_success "Twitch CLI is already installed."
fi

# Install project dependencies
echo "Installing project dependencies..."
if ! bun install; then
    print_error "Failed to install dependencies. Please check your internet connection and try again."
    exit 1
fi

# Restore .env* files if they were backed up
if [ -n "$backup_dir" ] && [ -d "$backup_dir" ]; then
    echo "Restoring .env files..."
    for backup_file in "$backup_dir"/*; do
        if [ -f "$backup_file" ]; then
            echo "Restoring $(basename "$backup_file")..."
            cp "$backup_file" "$install_path/"
        fi
    done
    rm -rf "$backup_dir"
    print_success ".env files restored successfully."
    echo
fi

# Check if user wants to run setup script
echo -n "Do you want to run the setup script? (Y/n): "
read -r run_setup
if [[ ! "$run_setup" =~ ^[Nn]$ ]]; then
    echo "Running setup script..."
    bun setup
else
    echo "Skipping setup script."
fi

echo
echo "============================================"
print_success "Manao Twitch Bot installed successfully!"
echo "Installation location: $install_path"
echo "Version: $selected_version"
echo
echo "You can now run the bot using:"
echo
echo "bun run start"
echo
echo "Or execute the start script:"
echo "./START_MANAOBOT.sh"
echo "============================================"
echo

# Ask if user wants to open installation folder
echo -n "Do you want to open the installation folder? (Y/n): "
read -r open_folder
if [[ ! "$open_folder" =~ ^[Nn]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "$install_path"
    elif command -v open &> /dev/null; then
        open "$install_path"
    else
        echo "Cannot open folder automatically. Installation location: $install_path"
    fi
fi

echo "Installation complete!"