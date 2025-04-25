<p align="center">
  <a href="https://github.com/tinarskii/twitch-utils">
    <img src="/docs/manao.svg" height="64px" width="auto" />
    <h2 align="center">
      Manao
    </h2>
  </a>
  <p align="center">
    A collection of utilities and tools for Twitch streamers
  </p>
  <div style="display: flex; flex-wrap: wrap; justify-items: center; justify-content: center">
<a href="https://wakatime.com/badge/user/5cb7cd14-ac7e-4fc0-9f81-6036760cb6a3/project/018dddd9-a419-43b0-95cd-8348fafaccad"><img src="https://wakatime.com/badge/user/5cb7cd14-ac7e-4fc0-9f81-6036760cb6a3/project/018dddd9-a419-43b0-95cd-8348fafaccad.svg" alt="wakatime"></a>
<a href="https://github.com/tinarskii/twitch-utils/pulse"><img src="https://img.shields.io/github/commit-activity/m/badges/shields" /></a>
    <img src="https://img.shields.io/github/license/tinarskii/twitch-utils" />   
    <img src="https://img.shields.io/github/languages/top/tinarskii/twitch-utils" />
    <a href="https://discord.gg/vkW7YMyYaf"><img src="https://img.shields.io/discord/964718161624715304" /></a>
    <a href="/.github/CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg" /></a>
    <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=plastic" />
  </div>
</p>

## Table of Contents

- [About](#-about)
- [Features](#-features)
- [Installation](#-installation)
- [Contributing](#-contributing)
- [License](#-license)
- [FAQ](#-faq)

## 🤔 About

This project includes a Twitch chatbot and some overlays used in my Twitch channel (tinarskii). Inspired
by [thananon/twitch_tools](https://github.com/thananon/twitch_tools)
and [lucidkarn/luciabot](https://github.com/lucidkarn/luciabot).
The project is written in TypeScript and uses Bun instead of Node.js, many features may be unavailable or not working as
expected if you are not using Bun.

## 📍 Features

### Chat bot

- Moderation
    1. `Announce` - Announce a message to the chat
    2. `Game    ` - Change stream's game
    3. `Shoutout` - Shoutout a user
    4. `Stream  ` - Change stream's title


- Capitalism
    1. `Balance ` - Check your balance
    2. `Daily   ` - Claim your daily reward
    3. `Gamble  ` - Gamble your money
    4. `Give    ` - Give money to another user
    5. `Weekly  ` - Claim your weekly reward


- Miscellaneous
    1. `Eat     ` - Chose a random food to eat
    2. `Hate    ` - How much do you hate someone?
    3. `Help    ` - Show help message
    4. `Love    ` - How much do you love someone?
    5. `Stomp   ` - Stomp on someone


- Overlay & Customization
    1. `Nickname` - Change your nickname (Linked with the chat overlay)


- Song Request
    1. `Song-Queue   (sq)` - Show the music queue
    2. `Song-Remove  (rm)` - Remove a song from the queue
    3. `Song-Skip    (sk)` - Skip the current song
    4. `Song-Request (sr)` - Add a song to the queue

### Overlay

- `Chat Overlay` - Show chat messages on the stream (Nickname command linked)
- `Event Feed  ` - Show recent events on the stream (Linked with economic commands)
- `Music Player` - Play music on the stream (Click now-playing box to hide the video)
- `Music Queue ` - Show the music queue on the stream (Linked with the music player)

## 🛠️ Installation

### Prerequisites

- [Bun](https://bun.sh) (Version 1.0.0 or higher is recommended)
- [Twitch Developer Account](https://dev.twitch.tv/) (For the chatbot)

### Setup

1. Clone the repository

```sh
git clone https://github.com/tinarskii/twitch-utils.git
cd twitch-utils
```

2. Install dependencies

```sh
bun install
```

3. Rename a `.env.example` file to `.env` in the root directory, the file content should be something like this:

```dotenv
CLIENT_ID= # Read FAQ to get your creditentials
CLIENT_SECRET= # Read FAQ to get your creditentials

USER_ACCESS_TOKEN= # Read FAQ to get your creditentials
REFRESH_TOKEN= # Read FAQ to get your creditentials

BROADCASTER_USER_ACCESS_TOKEN= # Read FAQ to get your creditentials
BROADCASTER_REFRESH_TOKEN= # Read FAQ to get your creditentials

TW_CHANNEL= # Your channel name that wants the bot to connect to
TW_ID= # Your bot's channel ID (You can get it from the Twitch API or this site: https://www.streamweasels.com/support/convert-twitch-username-to-user-id)
BROADCASTER_ID= # Your channel ID (You can get it from the Twitch API or this site: https://www.streamweasels.com/support/convert-twitch-username-to-user-id)

NODE_ENV= # Set it to "production" if you are running the bot in production, otherwise prefer "development"
OVERLAY_TOKEN= # A random string to authenticate the overlay (E.g. /chat-[your-token])
```

4. Start the bot

```sh
bun start
```

## 👋 Contributing

If you want to contribute to the project, please read the [CONTRIBUTING.md](/.github/CONTRIBUTING.md) file.
However, if you have any questions, feel free to ask in the [Discord index](https://discord.gg/vkW7YMyYaf).

## 📜 License

This project is licensed under the [Mozilla Public License 2.0](/LICENSE).

## 🙋‍♂️ FAQ

### How do I get my Twitch API credentials?

You can get your Twitch API credentials by creating a **new application** (not extensions) in
the [Twitch Developer Portal](https://dev.twitch.tv/). Set "OAuth Redirect URL" to `http://localhost:3000/`, set the category
to "Chat Bot" and client type to "Confidential". After that, you will be redirected to the application page.
Get your client ID and client secret from the application's dashboard, and add them to your `.env` file.
After that, you can install [TwitchCLI](https://dev.twitch.tv/docs/cli/) and run the following command to get your
access token:

```sh
twitch token -u -s "user:edit user:read:email chat:read chat:edit channel:moderate moderation:read moderator:manage:shoutouts moderator:manage:announcements channel:manage:moderators channel:manage:broadcast channel:read:vips channel:read:subscriptions channel:manage:vips channel:read:redemptions channel:manage:redemptions moderator:read:followers bits:read"
```

You will receive a user access token and a refresh token, add them to your `.env` file.
**Note:** You should run the following command 2 times, once for the bot account and once for the broadcaster account, make sure
to logout of Twitch before running the command again. Put the access token and refresh token in the `.env` file accordingly.

### What's `index.crt` and `index.key` files?

These files are used to run the webserver in HTTPS. If you want to use HTTPS, you can generate these files using OpenSSL
or any other tools. If you don't want to use HTTPS, you can remove the `index.crt` and `index.key` in `index/index.ts`.

### I couldn't install Bun in my system

_~~Currently, Bun is only available for Linux and MacOS. If you are using Windows, you can use WSL or a virtual machine to
run the project.~~_
**Bun is now available for Windows**, you can follow the [official documentation](https://bun.sh/docs/installation/windows) 
for the installation.
For further assistance about installing Bun, you may ask in the [Bun official Discord index](https://bun.sh/discord).