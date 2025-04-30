#!/bin/bash

echo "============================================"
echo "        Installing Manao Twitch Bot..."
echo "============================================"
echo

# Check if Git is installed
if ! command -v git &> /dev/null
then
    echo "Git not found. Installing Git..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y git
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install git
    fi
else
    echo "Git is already installed."
fi

# Clone the Manao repository
read -p "Enter a folder name for installation (default: manao): " folderName
folderName=${folderName:-manao}

if [ -d "$folderName" ]; then
    echo "Directory $folderName already exists. Pulling latest changes..."
    cd "$folderName" || exit
    git pull origin main
else
    echo "Cloning repository into $folderName..."
    git clone https://github.com/tinarskii/manao.git "$folderName"
    cd "$folderName" || exit
fi

# Check if Bun is installed
if ! command -v bun &> /dev/null
then
    echo "Bun not found. Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
else
    echo "Bun is already installed."
fi

# Check if Twitch CLI is installed
if ! command -v twitch &> /dev/null
then
    echo "Twitch CLI not found. Installing Twitch CLI..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y twitch-cli
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install twitch-cli
    fi
else
    echo "Twitch CLI is already installed."
fi

# Install project dependencies
echo "Installing project dependencies..."
bun install

# Run the setup script
echo
echo "Running setup script..."
bun run setup.ts

echo
echo "============================================"
echo "Manao Twitch Bot installed successfully!"
echo "You can now run the bot using:"
echo
echo "bun run start"
echo
echo "Or use the following command to start the bot:"
echo "./start-bot.sh"
echo "============================================"
echo

# End of script
