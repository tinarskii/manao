import "dotenv/config";
import { confirm, input } from "@inquirer/prompts";
import chalk from "chalk";
import path from "node:path";
import { exec as execCb } from "node:child_process";
import { promisify } from "node:util";
import * as process from "node:process";

const exec = promisify(execCb);
const TWITCH_SCOPES = [
  "user:edit", "user:read:email", "chat:read", "chat:edit",
  "channel:moderate", "moderation:read", "moderator:manage:shoutouts",
  "moderator:manage:announcements", "channel:manage:moderators",
  "channel:manage:broadcast", "channel:read:vips", "channel:read:subscriptions",
  "channel:manage:vips", "channel:read:redemptions", "channel:manage:redemptions",
  "moderator:read:followers", "bits:read"
];

interface ConfigTokens {
  accessToken: string;
  refreshToken: string;
}
interface UserInfo {
  userID: string;
  login?: string;
}

async function fetchTokens(cliPath: string): Promise<ConfigTokens> {
  const cmd = `${cliPath} token -u -s "${TWITCH_SCOPES.join(" ")}"`;
  const { stdout, stderr } = await exec(cmd);

  // Debug print all lines
  console.debug(chalk.gray("CLI output:"), stdout);

  const accessMatch = stderr.match(/User Access Token:\s*(\S+)/);
  const refreshMatch = stderr.match(/Refresh Token:\s*(\S+)/);

  if (!accessMatch || !refreshMatch) {
    throw new Error("Missing tokens from Twitch CLI output");
  }

  return { accessToken: accessMatch[1], refreshToken: refreshMatch[1] };
}

async function fetchUserInfo(cliPath: string, accessToken: string): Promise<UserInfo> {
  const cmd = `${cliPath} token -v ${accessToken}`;
  const { stdout, stderr } = await exec(cmd);
  if (stderr) console.warn(chalk.yellow(`Twitch CLI warning: ${stderr.trim()}`));

  console.debug(chalk.gray("Verify output:"), stdout);

  const idMatch = stdout.match(/User ID:\s*(\d+)/);
  const loginMatch = stdout.match(/Login:\s*(\S+)/);

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
  console.log(chalk.bold.underline.magenta("⟦◄ ManaoBot v1.0.0 - Configuration ►⟧"));

  const cliPath = path.join(__dirname, "resources", "twitch-cli", "twitch.exe");

  // Bot account
  await promptLogin("Have you LOGIN to your BOT Twitch account in the default browser before you continue?");
  const botTokens = await fetchTokens(cliPath);
  const botInfo   = await fetchUserInfo(cliPath, botTokens.accessToken);

  // Overlay Token
  let overlayToken = await input({ message: "Overlay token (leave blank to randomize):" });
  if (!overlayToken) overlayToken = Math.random().toString(36).substring(2, 15);

  // Broadcaster account
  await promptLogin("Have you LOGIN to your BROADCASTER Twitch account in the default browser before you continue?");
  const bcTokens = await fetchTokens(cliPath);
  const bcInfo   = await fetchUserInfo(cliPath, bcTokens.accessToken);

  // Set environment variables
  Object.assign(process.env, {
    USER_ACCESS_TOKEN:        botTokens.accessToken,
    REFRESH_TOKEN:            botTokens.refreshToken,
    OVERLAY_TOKEN:            overlayToken,
    BROADCASTER_ACCESS_TOKEN: bcTokens.accessToken,
    BROADCASTER_REFRESH_TOKEN: bcTokens.refreshToken,
    TW_ID:                    botInfo.userID,
    BROADCASTER_ID:           bcInfo.userID,
    TW_CHANNEL:               bcInfo.login ?? ""
  });

  console.log(chalk.green("Configuration complete!"));
}

async function run() {
  try {
    await startConfig();

    // dynamically import and start only after config
    const { main } = await import("./client/client");
    const { startApp } = await import("./server");

    main();
    startApp();
  } catch (err: any) {
    console.error(chalk.bold.red("Configuration failed:"), err.message);
    process.exit(1);
  }
}

run();
