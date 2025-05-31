import chalk from "chalk";
import path from "node:path";
import { input, confirm } from "@inquirer/prompts";

export type Lang = "en" | "th";

interface ConfigTokens {
  accessToken: string;
  refreshToken: string;
}

interface UserInfo {
  userID: string;
  login?: string;
}

interface LanguageTexts {
  promptLogin: string;
  promptLoginBot: string;
  overlayToken: string;
  configComplete: string;
  pressEnterToContinue: string;
  locatingCli: string;
  configuringCli: string;
  fetchingBotTokens: string;
  botAccountSuccess: string;
  fetchingBroadcasterTokens: string;
  broadcasterAccountSuccess: string;
  generatedOverlayToken: string;
  creatingConfigFile: string;
  configSavedTo: string;
}

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
] as const;

const LANG_TEXTS: Record<Lang, LanguageTexts> = {
  en: {
    promptLogin:
      "To continue, please login to your BROADCASTER Twitch account (the primary account for streaming).",
    promptLoginBot:
      "To continue, please login to your BOT Twitch account (the secondary account for the bot).",
    overlayToken: "Password for accessing Overlay (leave blank to randomize):",
    configComplete: "✅ Configuration complete! .env file created.",
    pressEnterToContinue: "Press Enter to continue",
    locatingCli: "📡 Locating Twitch CLI...",
    configuringCli: "⚙️  Configuring Twitch CLI...",
    fetchingBotTokens: "🔑 Fetching bot tokens...",
    botAccountSuccess: "✅ Bot account:",
    fetchingBroadcasterTokens: "🔑 Fetching broadcaster tokens...",
    broadcasterAccountSuccess: "✅ Broadcaster account:",
    generatedOverlayToken: "🎲 Generated random overlay token",
    creatingConfigFile: "📝 Creating configuration file...",
    configSavedTo: "📄 Configuration saved to:",
  },
  th: {
    promptLogin:
      "เพื่อดำเนินการต่อ โปรดเข้าสู่ระบบบัญชี Twitch ของคุณที่ใช้ในการสตรีม (บัญชีหลักที่ใช้สตรีม)",
    promptLoginBot:
      "เพื่อดำเนินการต่อ โปรดเข้าสู่ระบบบัญชีบอต Twitch ของคุณ (บัญชีรองที่ใช้สำหรับบอต)",
    overlayToken: "รหัสเพื่อเข้าถึง Overlay (เว้นว่างไว้เพื่อสุ่ม):",
    configComplete: "✅ การกำหนดค่าครบถ้วน! สร้างไฟล์ .env เรียบร้อยแล้ว",
    pressEnterToContinue: "กด Enter เพื่อดำเนินการต่อ",
    locatingCli: "📡 กำลังค้นหา Twitch CLI...",
    configuringCli: "⚙️  กำลังตั้งค่า Twitch CLI...",
    fetchingBotTokens: "🔑 กำลังดึงโทเค็นของบอต...",
    botAccountSuccess: "✅ บัญชีบอต:",
    fetchingBroadcasterTokens: "🔑 กำลังดึงโทเค็นของผู้สตรีม...",
    broadcasterAccountSuccess: "✅ บัญชีผู้สตรีม:",
    generatedOverlayToken: "🎲 สร้างโทเค็น overlay แบบสุ่มแล้ว",
    creatingConfigFile: "📝 กำลังสร้างไฟล์การกำหนดค่า...",
    configSavedTo: "📄 บันทึกการกำหนดค่าไปยัง:",
  },
} as const;

class TwitchCliError extends Error {
  constructor(message: string, public readonly details?: string) {
    super(message);
    this.name = "TwitchCliError";
  }
}

class TokenParsingError extends Error {
  constructor(message: string, public readonly output?: string) {
    super(message);
    this.name = "TokenParsingError";
  }
}

/**
 * Locates the Twitch CLI executable
 */
async function locateTwitchCli(): Promise<string> {
  const bundledPath = path.join(import.meta.dir, "resources", "twitch-cli", "twitch.exe");

  // Check if bundled CLI exists
  const bundledFile = Bun.file(bundledPath);
  if (await bundledFile.exists()) {
    return bundledPath;
  }

  // Fallback to system PATH
  return "twitch.exe";
}

/**
 * Fetches tokens from Twitch CLI
 */
async function fetchTokens(cliPath: string): Promise<ConfigTokens> {
  try {
    const proc = Bun.spawn([
      cliPath,
      "token",
      "-u",
      "-s",
      TWITCH_SCOPES.join(" "),
    ], {
      stderr: "pipe",
      stdout: "pipe",
    });

    const [stderr, stdout] = await Promise.all([
      new Response(proc.stderr).text(),
      new Response(proc.stdout).text(),
    ]);

    await proc.exited;

    if (proc.exitCode !== 0) {
      throw new TwitchCliError(
        `Twitch CLI exited with code ${proc.exitCode}`,
        stderr || stdout
      );
    }

    const output = stderr || stdout;
    const accessMatch = output.match(/User Access Token:\s*(\S+)/);
    const refreshMatch = output.match(/Refresh Token:\s*(\S+)/);

    if (!accessMatch || !refreshMatch) {
      throw new TokenParsingError(
        "Failed to parse access or refresh token from CLI output",
        output
      );
    }

    return {
      accessToken: accessMatch[1],
      refreshToken: refreshMatch[1],
    };
  } catch (error) {
    if (error instanceof TwitchCliError || error instanceof TokenParsingError) {
      throw error;
    }
    throw new TwitchCliError(`Failed to execute Twitch CLI: ${error}`);
  }
}

/**
 * Fetches user information using access token
 */
async function fetchUserInfo(cliPath: string, accessToken: string): Promise<UserInfo> {
  try {
    const proc = Bun.spawn([cliPath, "token", "-v", accessToken], {
      stdout: "pipe",
      stderr: "pipe",
    });

    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    await proc.exited;

    if (proc.exitCode !== 0) {
      throw new TwitchCliError(
        `Token validation failed with code ${proc.exitCode}`,
        stderr || stdout
      );
    }

    const output = stdout || stderr;
    const idMatch = output.match(/User ID:\s*(\d+)/);
    const loginMatch = output.match(/Login:\s*(\S+)/);

    if (!idMatch) {
      throw new TokenParsingError(
        "Failed to parse User ID from token validation output",
        output
      );
    }

    return {
      userID: idMatch[1],
      login: loginMatch?.[1],
    };
  } catch (error) {
    if (error instanceof TwitchCliError || error instanceof TokenParsingError) {
      throw error;
    }
    throw new TwitchCliError(`Failed to validate token: ${error}`);
  }
}

/**
 * Configures Twitch CLI with client credentials
 */
async function configureTwitchCli(
  cliPath: string,
  clientID: string,
  clientSecret: string
): Promise<void> {
  try {
    const proc = Bun.spawn([
      cliPath,
      "configure",
      "-i",
      clientID,
      "-s",
      clientSecret,
    ], {
      stdout: "pipe",
      stderr: "pipe",
    });

    await proc.exited;

    if (proc.exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      throw new TwitchCliError(
        `Failed to configure Twitch CLI (exit code: ${proc.exitCode})`,
        stderr
      );
    }
  } catch (error) {
    if (error instanceof TwitchCliError) {
      throw error;
    }
    throw new TwitchCliError(`Configuration error: ${error}`);
  }
}

/**
 * Generates environment file content
 */
function generateEnvContent(
  clientID: string,
  clientSecret: string,
  botInfo: UserInfo,
  botTokens: ConfigTokens,
  broadcasterInfo: UserInfo,
  broadcasterTokens: ConfigTokens,
  overlayToken: string
): string {
  return [
    `CLIENT_ID=${clientID}`,
    `CLIENT_SECRET=${clientSecret}`,
    "",
    `TW_ID=${botInfo.userID}`,
    `USER_ACCESS_TOKEN=${botTokens.accessToken}`,
    `REFRESH_TOKEN=${botTokens.refreshToken}`,
    "",
    `BROADCASTER_ID=${broadcasterInfo.userID}`,
    `BROADCASTER_ACCESS_TOKEN=${broadcasterTokens.accessToken}`,
    `BROADCASTER_REFRESH_TOKEN=${broadcasterTokens.refreshToken}`,
    "",
    `OVERLAY_TOKEN=${overlayToken}`,
  ].join("\n");
}

/**
 * Validates input parameters
 */
function validateInputs(clientID: string, clientSecret: string): void {
  if (!clientID?.trim()) {
    throw new Error("Client ID is required and cannot be empty");
  }

  if (!clientSecret?.trim()) {
    throw new Error("Client Secret is required and cannot be empty");
  }
}

/**
 * Main setup function with improved error handling and logging
 */
export async function startConfigWithParams(
  lang: Lang,
  clientID: string,
  clientSecret: string
): Promise<void> {
  // Validate inputs
  validateInputs(clientID, clientSecret);

  const texts = LANG_TEXTS[lang];

  try {
    // Locate Twitch CLI
    console.log(chalk.blue(texts.locatingCli));
    const cliPath = await locateTwitchCli();

    // Configure Twitch CLI
    console.log(chalk.blue(texts.configuringCli));
    await configureTwitchCli(cliPath, clientID, clientSecret);

    // Bot account setup
    console.log(chalk.cyanBright(`\n🤖 ${texts.promptLoginBot}`));
    await confirm({
      message: `${texts.promptLoginBot} (${texts.pressEnterToContinue})`,
      default: true
    });

    console.log(chalk.blue(texts.fetchingBotTokens));
    const botTokens = await fetchTokens(cliPath);
    const botInfo = await fetchUserInfo(cliPath, botTokens.accessToken);
    console.log(chalk.green(`${texts.botAccountSuccess} ${botInfo.login || botInfo.userID}`));

    // Broadcaster account setup
    console.log(chalk.cyanBright(`\n📺 ${texts.promptLogin}`));
    await confirm({
      message: `${texts.promptLogin} (${texts.pressEnterToContinue})`,
      default: true
    });

    console.log(chalk.blue(texts.fetchingBroadcasterTokens));
    const broadcasterTokens = await fetchTokens(cliPath);
    const broadcasterInfo = await fetchUserInfo(cliPath, broadcasterTokens.accessToken);
    console.log(chalk.green(`${texts.broadcasterAccountSuccess} ${broadcasterInfo.login || broadcasterInfo.userID}`));

    // Overlay token setup
    let overlayToken = await input({
      message: texts.overlayToken,
      default: ""
    });

    if (!overlayToken?.trim()) {
      overlayToken = crypto.randomUUID();
      console.log(chalk.yellow(texts.generatedOverlayToken));
    }

    // Generate and write .env file
    console.log(chalk.blue(texts.creatingConfigFile));
    const envContent = generateEnvContent(
      clientID,
      clientSecret,
      botInfo,
      botTokens,
      broadcasterInfo,
      broadcasterTokens,
      overlayToken
    );

    const envPath = path.join(import.meta.dir, ".env");
    await Bun.write(envPath, envContent);

    console.log(chalk.green(`\n${texts.configComplete}`));
    console.log(chalk.dim(`${texts.configSavedTo} ${envPath}`));

  } catch (error) {
    if (error instanceof TwitchCliError) {
      throw new Error(`Twitch CLI Error: ${error.message}${error.details ? `\nDetails: ${error.details}` : ""}`);
    }

    if (error instanceof TokenParsingError) {
      throw new Error(`Token Parsing Error: ${error.message}${error.output ? `\nOutput: ${error.output}` : ""}`);
    }

    // Re-throw other errors with context
    throw new Error(`Setup failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}