import { confirm, input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import * as process from "node:process";
import { version } from "./package.json";

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
    chalk.bold.underline.magenta(`⟦◄ ManaoBot v${version} - Configuration ►⟧`),
  );

  let lang = {
    en: {
      beforeStart: "🛠 Before we start, you need to create a Twitch Application.",
      goTo: "Go to: ",
      createAppInfo1: "Click 'Register Your Application'",
      createAppInfo2: "When creating the app, set the OAuth Redirect URL to: ",
      createAppInfo3: "You can leave the category as 'Application Integration' or anything.",
      createAppInfo4: "Set client type to 'Confedential'",
      createAppInfo5: "The application name doesn't matter — name it anything you want.",
      openBrowser: "Open browser to continue?",
      confirmCreateApp: "Press 'Enter' once you have created the app and have your Client ID and Client Secret ready.",
      enterClientID: "Enter your Twitch Application Client ID:",
      enterClientSecret: "Enter your Twitch Application Client Secret:",
      promptLogin: "To continue, please login to your BROADCASTER Twitch account (the account that BOT will be running on).",
      promptLoginBot: "To continue, please login to your BOT Twitch account (can be the same as BROADCASTER account).",
      overlayToken: "Overlay token (leave blank to randomize):",
      configComplete: "✅ Configuration complete! .env file created.",
    },
    th: {
      beforeStart: "🛠 ก่อนที่เราจะเริ่ม คุณต้องสร้าง Twitch Application",
      goTo: "ไปที่: ",
      createAppInfo1: "คลิก 'ลงทะเบียนแอพพลิเคชั่น'",
      createAppInfo2: "เมื่อสร้างแอป ให้ตั้งค่า OAuth Redirect URL เป็น: ",
      createAppInfo3: "คุณสามารถปล่อยหมวดหมู่เป็น 'Application Integration' หรืออะไรก็ได้",
      createAppInfo4: "ตั้งค่าประเภทไคลเอนต์เป็น 'โปรดเก็บรักษาเป็นความลับ'",
      createAppInfo5: "ชื่อแอปพลิเคชันไม่สำคัญ — ตั้งชื่ออะไรก็ได้ที่คุณต้องการ",
      openBrowser: "เปิดเบราว์เซอร์เพื่อดำเนินการต่อ?",
      confirmCreateApp: "กด 'Enter' เมื่อคุณสร้างแอปและมี Client ID (ID ไคลแอนต์) และ Client Secret (ความลับบนไคลเอนท์) พร้อมแล้ว",
      enterClientID: "ใส่ Client ID ของ Twitch Application ของคุณ:",
      enterClientSecret: "ใส่ Client Secret ของ Twitch Application ของคุณ:",
      promptLogin: "เพื่อดำเนินการต่อ โปรดเข้าสู่ระบบบัญชี Twitch ของคุณที่ใช้ในการสตรีม (บัญชีที่ BOT จะทำงานอยู่)",
      promptLoginBot: "เพื่อดำเนินการต่อ โปรดเข้าสู่ระบบบัญชีบอต Twitch ของคุณ (สามารถเป็นบัญชีเดียวกับบัญชีที่ใช้สตรีม)",
      overlayToken: "Overlay token (เว้นว่างไว้เพื่อสุ่ม):",
      configComplete: "✅ การกำหนดค่าครบถ้วน! สร้างไฟล์ .env เรียบร้อยแล้ว",
    }
  }

  let currentlang = "en";

  let cliPath = path.join(__dirname, "resources", "twitch-cli", "twitch.exe");
  if (!await Bun.file(cliPath).exists()) cliPath = "twitch.exe"; // Assuming the installer do its job


  // ask language (en/th)
  const langChoice = await select({
    message: "Choose setup language:",
    choices: ["English", "ภาษาไทย"],
  });

  if (langChoice === "English") currentlang = "en";
  if (langChoice === "ภาษาไทย") currentlang = "th";


  console.log(
    chalk.yellowBright(
      lang[currentlang as keyof typeof lang].beforeStart
    ),
  );
  console.log(
    lang[currentlang as keyof typeof lang].goTo + chalk.blueBright("https://dev.twitch.tv/console/apps"),
  );
  console.log(chalk.gray(`→ ${lang[currentlang as keyof typeof lang].createAppInfo1}`));
  console.log(
    chalk.gray(`→ ${lang[currentlang as keyof typeof lang].createAppInfo2}`),
      chalk.bold("http://localhost:3000"),
  );
  console.log(
    chalk.gray(
      `→ ${lang[currentlang as keyof typeof lang].createAppInfo3}`,
    ),
  );
  console.log(chalk.gray(`→ ${lang[currentlang as keyof typeof lang].createAppInfo4}`));
  console.log(
    chalk.gray(
      `→ ${lang[currentlang as keyof typeof lang].createAppInfo5}`,
    ),
  );

  let result = await confirm({ message: `${lang[currentlang as keyof typeof lang].openBrowser}` });

  if (result) await openBrowser("https://dev.twitch.tv/console/apps");

  await confirm({
    message:
      `${lang[currentlang as keyof typeof lang].confirmCreateApp}`,
  });

  // Ask for Client ID and Secret
  const clientID = await input({
    message: lang[currentlang as keyof typeof lang].enterClientID,
  });
  const clientSecret = await input({
    message: lang[currentlang as keyof typeof lang].enterClientSecret,
  });

  // Broadcaster account
  await promptLogin(
    `\n${lang[currentlang as keyof typeof lang].promptLogin}`,
  );
  const bcTokens = await fetchTokens(cliPath);
  const bcInfo = await fetchUserInfo(cliPath, bcTokens.accessToken);

  // Bot account
  await promptLogin(
    `\n${lang[currentlang as keyof typeof lang].promptLoginBot}`,
  );
  const botTokens = await fetchTokens(cliPath);
  const botInfo = await fetchUserInfo(cliPath, botTokens.accessToken);

  // Overlay Token
  let overlayToken = await input({
    message:
      `${lang[currentlang as keyof typeof lang].overlayToken}`,
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

  console.log(chalk.green("\n" + lang[currentlang as keyof typeof lang].configComplete));
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
