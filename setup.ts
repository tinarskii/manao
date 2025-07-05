import { input, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import { version } from "./package.json";

type Lang = "en" | "th";

const TWITCH_SCOPES = [
  "user:edit", "user:read:email", "chat:read", "chat:edit",
  "channel:moderate", "moderation:read", "moderator:manage:shoutouts",
  "moderator:manage:announcements", "channel:manage:moderators",
  "channel:manage:broadcast", "channel:read:vips", "channel:read:subscriptions",
  "channel:manage:vips", "channel:read:redemptions", "channel:manage:redemptions",
  "moderator:read:followers", "bits:read",
];

const MESSAGES: Record<Lang, any> = {
  en: {
    welcome: `╔════════════════════════════════╗\n║        Welcome to Manao        ║\n╚════════════════════════════════╝`,
    tutorial: "Read the tutorial at: https://github.com/tinarskii/manao/wiki/Setup-and-Installation",
    clientId: "Enter your Twitch Client ID:",
    clientSecret: "Enter your Twitch Client Secret:",
    setupDone: "✅ Setup completed successfully!",
    setupFailed: "❌ Setup failed. Please try again.",
    runningSetup: "Running setup...",
    confirmSetup: "Proceed with setup?",
  },
  th: {
    welcome: `╔════════════════════════════════╗\n║        ยินดีต้อนรับสู่ Manao       ║\n╚════════════════════════════════╝`,
    tutorial: "อ่านวิธีการตั้งค่าที่: https://github.com/tinarskii/manao/wiki/(TH)-Setup-and-Installation",
    clientId: "กรุณาใส่ Twitch Client ID ของคุณ:",
    clientSecret: "กรุณาใส่ Twitch Client Secret ของคุณ:",
    setupDone: "✅ การตั้งค่าเสร็จสมบูรณ์!",
    setupFailed: "❌ การตั้งค่าล้มเหลว โปรดลองอีกครั้ง",
    runningSetup: "กำลังตั้งค่า...",
    confirmSetup: "ดำเนินการตั้งค่าต่อหรือไม่?",
  }
};

async function openBrowser(url: string) {
  Bun.spawn(["cmd", "/c", "start", "", url]);
}

async function fetchTokens(clientId: string, clientSecret: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope: TWITCH_SCOPES.join(" "),
  });

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: params,
  });

  if (!response.ok) throw new Error("Failed to fetch tokens");
  return response.json();
}

async function runSetup(lang: Lang = "en") {
  const msg = MESSAGES[lang];
  console.log(chalk.greenBright(msg.welcome));
  console.log(chalk.blue(msg.tutorial));

  const shouldProceed = await confirm({ message: msg.confirmSetup });
  if (!shouldProceed) return;

  console.log(chalk.yellow(msg.runningSetup));

  try {
    const clientId = await input({ message: msg.clientId });
    const clientSecret = await input({ message: msg.clientSecret });

    const tokens = await fetchTokens(clientId, clientSecret);

    const config = {
      version,
      clientId,
      clientSecret,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || "",
    };

    const configPath = Bun.resolveSync(process.cwd(), "manao.config.json");
    await writeFile(configPath, JSON.stringify(config, null, 2));

    console.log(chalk.greenBright(msg.setupDone));
    console.log(`✅ Config saved at: ${configPath}`);
  } catch (err) {
    console.error(chalk.redBright(msg.setupFailed));
    console.error(err);
  }
}

// Run setup with language auto-detect fallback
runSetup(process.env.LANG?.startsWith("th") ? "th" : "en");
