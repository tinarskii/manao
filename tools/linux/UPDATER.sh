#!/bin/bash

# Manao Twitch Bot Updater for Linux/macOS
# Make executable with: chmod +x updater.sh

set -e  # Exit on any error

echo "============================================"
echo "         Updating Manao Twitch Bot..."
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

# Check if we're in a Manao installation directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found."
    echo "Please run this updater from the Manao installation directory."
    exit 1
fi

# Check if this is actually a Manao project
if ! grep -qi "manao" package.json; then
    print_error "This doesn't appear to be a Manao installation."
    echo "Please run this updater from the correct Manao directory."
    exit 1
fi

# Get current directory (installation path)
install_path="$(pwd)"
echo "Current installation: $install_path"

# Check if Git is available
if ! command -v git &> /dev/null; then
    print_error "Git not found. Please install Git to use the updater."
    exit 1
fi

# Check if we're in a Git repository
if [ ! -d ".git" ]; then
    print_error "This is not a Git repository."
    echo "The updater requires a Git-based installation."
    echo "Please use the installer to reinstall Manao."
    exit 1
fi

# Get current version/branch
current_version=$(git describe --tags --exact-match 2>/dev/null || echo "")
if [ -z "$current_version" ]; then
    current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
    if [ -z "$current_branch" ]; then
        current_version="Unknown"
    else
        current_version="$current_branch (branch)"
    fi
fi

echo "Current version: $current_version"
echo

# Fetch latest information from remote
echo "Fetching latest updates..."
if ! git fetch --tags 2>/dev/null; then
    print_warning "Failed to fetch latest updates. Continuing with local information."
fi

# Fetch available releases from GitHub
echo "Fetching available releases..."
echo

# Create temporary file for releases
temp_file=$(mktemp)
if curl -s "https://api.github.com/repos/tinarskii/manao/releases" | grep -o '"tag_name": *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' > "$temp_file" 2>/dev/null; then
    if [ -s "$temp_file" ]; then
        echo "Available versions:"
        echo "0. Latest (git pull)"
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

        echo -n "Select a version (0-$count) or press Enter for latest: "
        read -r version_choice

        if [ -z "$version_choice" ] || [ "$version_choice" = "0" ]; then
            selected_version="latest"
            echo "Updating to latest version."
        elif [ "$version_choice" -ge 1 ] && [ "$version_choice" -le "$count" ] 2>/dev/null; then
            eval "selected_version=\$version$version_choice"
            echo "Selected version: $selected_version"
        else
            echo "Invalid selection. Updating to latest version."
            selected_version="latest"
        fi
    else
        print_warning "No releases found. You can still update to latest."
        selected_version="latest"
    fi
else
    print_warning "Failed to fetch releases from GitHub. You can still update to latest."
    echo
    echo "Available options:"
    echo "1. Update to latest (git pull)"
    echo "2. Cancel update"
    echo
    echo -n "Select an option (1-2): "
    read -r choice
    if [ "$choice" = "1" ]; then
        selected_version="latest"
    else
        echo "Update cancelled."
        rm -f "$temp_file"
        exit 0
    fi
fi

# Clean up temp file
rm -f "$temp_file"

echo

# Check for uncommitted changes
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    print_warning "You have uncommitted changes in your installation."
    echo "These changes might be lost during the update."
    echo
    git status --short
    echo
    echo -n "Do you want to continue? (y/N): "
    read -r continue_update
    if [[ ! "$continue_update" =~ ^[Yy]$ ]]; then
        echo "Update cancelled."
        exit 0
    fi
fi

# Backup .env* files and other important files
backup_dir=$(mktemp -d)
echo "Backing up configuration files..."

# Backup .env* files
if ls .env* 1> /dev/null 2>&1; then
    for env_file in .env*; do
        if [ -f "$env_file" ]; then
            echo "Backing up $env_file..."
            cp "$env_file" "$backup_dir/"
        fi
    done
fi

# Backup database files
if ls bot-data.sqlite 1> /dev/null 2>&1; then
        echo "Backing up database file..."
        cp bot-data.sqlite "$backup_dir/"
    done
fi

# Backup any custom files the user might have added
if ls *.local.* 1> /dev/null 2>&1; then
    for local_file in *.local.*; do
        if [ -f "$local_file" ]; then
            echo "Backing up $local_file..."
            cp "$local_file" "$backup_dir/"
        fi
    done
fi

if ls *.custom.* 1> /dev/null 2>&1; then
    for custom_file in *.custom.*; do
        if [ -f "$custom_file" ]; then
            echo "Backing up $custom_file..."
            cp "$custom_file" "$backup_dir/"
        fi
    done
fi

print_success "Configuration files backed up."
echo

# Function to restore files and exit
restore_and_exit() {
    echo
    echo "Update failed. Restoring configuration files..."
    for backup_file in "$backup_dir"/*; do
        if [ -f "$backup_file" ]; then
            echo "Restoring $(basename "$backup_file")..."
            cp "$backup_file" "."
        fi
    done
    rm -rf "$backup_dir"
    echo
    print_success "Configuration files restored."
    echo "Please check your internet connection and try again."
    exit 1
}

# Perform the update
echo "Updating Manao Twitch Bot..."
if [ "$selected_version" = "latest" ]; then
    echo "Pulling latest changes..."
    if ! git reset --hard HEAD >/dev/null 2>&1; then
        print_error "Failed to reset repository."
        restore_and_exit
    fi
    if ! git pull origin; then
        print_error "Failed to pull latest changes."
        restore_and_exit
    fi
else
    echo "Updating to version $selected_version..."
    if ! git reset --hard HEAD >/dev/null 2>&1; then
        print_error "Failed to reset repository."
        restore_and_exit
    fi
    if ! git checkout "$selected_version"; then
        echo "Failed to checkout version $selected_version."
        echo "Trying to fetch and checkout..."
        if ! git fetch --tags >/dev/null 2>&1; then
            print_error "Failed to fetch tags."
            restore_and_exit
        fi
        if ! git checkout "$selected_version"; then
            print_error "Failed to update to version $selected_version."
            restore_and_exit
        fi
    fi
fi

echo
print_success "Update completed successfully!"
echo

# Check if Bun is available
if ! command -v bun &> /dev/null; then
    print_warning "Bun not found. Please install Bun to install dependencies."
    echo "You can install Bun from: https://bun.sh"
else
    # Update dependencies
    echo "Installing/updating dependencies..."
    if ! bun install; then
        print_warning "Failed to install dependencies."
        echo "You may need to run 'bun install' manually."
    fi
fi

# Restore backed up files
echo
echo "Restoring configuration files..."
for backup_file in "$backup_dir"/*; do
    if [ -f "$backup_file" ]; then
        echo "Restoring $(basename "$backup_file")..."
        cp "$backup_file" "."
    fi
done

# Clean up backup directory
rm -rf "$backup_dir"

# Get new version info
new_version=$(git describe --tags --exact-match 2>/dev/null || echo "")
if [ -z "$new_version" ]; then
    new_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
    if [ -z "$new_branch" ]; then
        new_version="Unknown"
    else
        new_version="$new_branch (branch)"
    fi
fi

print_success "Configuration files restored successfully."
echo
echo "============================================"
print_success "Manao Twitch Bot updated successfully!"
echo
echo "Previous version: $current_version"
echo "Current version:  $new_version"
echo
echo "You can now run the bot using:"
echo "bun run start"
echo
echo "Or execute: ./START_MANAOBOT.sh"
echo "============================================"
echo