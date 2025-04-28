import { confirm, input } from "@inquirer/prompts";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import * as process from "node:process";

const TWITCH_SCOPES = [
  "user:edit",
  "user:read:email",
  "chat:read",
  "chat:edit",
  "channel:moderate",
  "moderation:read",
  "moderator:manage:shoutouts",
  "moderator:manage:announcements",
  "channel:manage:moderators",
  "channel:manage:broadcast",
  "channel:read:vips",
  "channel:read:subscriptions",
  "channel:manage:vips",
  "channel:read:redemptions",
  "channel:manage:redemptions",
  "moderator:read:followers",
  "bits:read",
];

interface ConfigTokens {
  accessToken: string;
  refreshToken: string;
}

interface UserInfo {
  userID: string;
  login?: string;
}

async function openBrowser(url: string): Promise<void> {
  spawn("cmd", ["/c", "start", "", url]);
}

async function fetchTokens(cliPath: string): Promise<ConfigTokens> {
  const { stdout, stderr } = Bun.spawnSync([
    cliPath,
    "token",
    "-u",
    "-s",
    TWITCH_SCOPES.join(" "),
  ]);

  const accessMatch = stderr.toString().match(/User Access Token:\s*(\S+)/);
  const refreshMatch = stderr.toString().match(/Refresh Token:\s*(\S+)/);

  if (!accessMatch || !refreshMatch) {
    throw new Error("Missing tokens from Twitch CLI output");
  }

  return { accessToken: accessMatch[1], refreshToken: refreshMatch[1] };
}

async function fetchUserInfo(
  cliPath: string,
  accessToken: string,
): Promise<UserInfo> {
  const { stdout } = Bun.spawnSync([cliPath, "token", "-v", accessToken]);
  const idMatch = stdout.toString().match(/User ID:\s*(\d+)/);
  const loginMatch = stdout.toString().match(/Login:\s*(\S+)/);

  if (!idMatch) {
    throw new Error("Failed to parse User ID");
  }

  return { userID: idMatch[1], login: loginMatch?.[1] };
}

async function promptLogin(promptMsg: string): Promise<void> {
  const confirmed = await confirm({ message: promptMsg });
  if (!confirmed) {
    console.log(chalk.bold.red("Login required. Exiting."));
    process.exit(1);
  }
}

async function startConfig(): Promise<void> {
  console.log(
    chalk.bold.underline.magenta("⟦◄ ManaoBot v1.0.0 - Configuration ►⟧"),
  );

  const cliPath = path.join(__dirname, "resources", "twitch-cli", "twitch.exe");

  // Inform user about Twitch app creation
  console.log(
    chalk.yellowBright(
      "\n🛠 Before we start, you need to create a Twitch Application.",
    ),
  );
  console.log(
    "Go to: " + chalk.blueBright("https://dev.twitch.tv/console/apps"),
  );
  console.log(chalk.gray("→ Click 'Register Your Application'"));
  console.log(
    chalk.gray("→ When creating the app, set the OAuth Redirect URL to: ") +
      chalk.bold("http://localhost:3000"),
  );
  console.log(
    chalk.gray(
      "→ You can leave the category as 'Application Integration' or anything.",
    ),
  );
  console.log(chalk.gray("→ Set client type to 'Confedential'"));
  console.log(
    chalk.gray(
      "→ The application name doesn't matter — name it anything you want.",
    ),
  );

  let result = await confirm({ message: "Open browser to continue?" });

  if (result) await openBrowser("https://dev.twitch.tv/console/apps");

  await confirm({
    message:
      "Press 'Enter' once you have created the app and have your Client ID and Client Secret ready.",
  });

  // Ask for Client ID and Secret
  const clientID = await input({
    message: "Enter your Twitch Application Client ID:",
  });
  const clientSecret = await input({
    message: "Enter your Twitch Application Client Secret:",
  });

  // Broadcaster account
  await promptLogin(
    "\nTo continue, please login to your BROADCASTER Twitch account (the account that BOT will be running on).",
  );
  const bcTokens = await fetchTokens(cliPath);
  const bcInfo = await fetchUserInfo(cliPath, bcTokens.accessToken);

  // Bot account
  await promptLogin(
    "\nTo continue, please login to your BOT Twitch account (can be the same as BROADCASTER account).",
  );
  const botTokens = await fetchTokens(cliPath);
  const botInfo = await fetchUserInfo(cliPath, botTokens.accessToken);

  // Overlay Token
  let overlayToken = await input({
    message: "Overlay token (leave blank to randomize):",
  });
  if (!overlayToken) overlayToken = Bun.randomUUIDv7();

  // Create .env content
  const envContent = `
USER_ACCESS_TOKEN=${botTokens.accessToken}
REFRESH_TOKEN=${botTokens.refreshToken}
OVERLAY_TOKEN=${overlayToken}
BROADCASTER_ACCESS_TOKEN=${bcTokens.accessToken}
BROADCASTER_REFRESH_TOKEN=${bcTokens.refreshToken}
TW_ID=${botInfo.userID}
BROADCASTER_ID=${bcInfo.userID}
TW_CHANNEL=${bcInfo.login ?? ""}
CLIENT_ID=${clientID}
CLIENT_SECRET=${clientSecret}
`.trim();

  await writeFile(path.join(process.cwd(), ".env"), envContent, "utf8");

  console.log(chalk.green("\n✅ Configuration complete! .env file created."));
}

async function run() {
  try {
    await startConfig();
    process.exit(0);
  } catch (err: any) {
    console.error(chalk.bold.red("Configuration failed:"), err.message);
    process.exit(1);
  }
}

run();
