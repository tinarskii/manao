import { createInterface } from "readline";
import { startConfigWithParams } from "./setup-core";
import { version } from "./package.json";

type Lang = "en" | "th";

interface Messages {
  titleLine1: string;
  titleLine2Left: string;
  titleLine2Right: string;
  titleLine3: string;
  selectLanguage: string;
  tutorialPrompt: string;
  tutorialOpening: string;
  tutorialContinue: string;
  clientIDPrompt: string;
  clientIDPlaceholder: string;
  clientSecretPrompt: string;
  clientSecretPlaceholder: string;
  runningSetup: string;
  setupFailed: string;
  setupSuccess: string;
  pressYorN: string;
  pressCtrlCExit: string;
}

const TUTORIALS: Record<Lang, string> = {
  en: "https://github.com/tinarskii/manao/wiki/Setup-and-Installation",
  th: "https://github.com/tinarskii/manao/wiki/(TH)-Setup-and-Installation",
} as const;

const MESSAGES: Record<Lang, Messages> = {
  en: {
    titleLine1: "╔════════════════════════════════╗",
    titleLine2Left: "║        ",
    titleLine2Right: "        ║",
    titleLine3: "╚════════════════════════════════╝",
    selectLanguage: "Select setup language:",
    tutorialPrompt:
      "Do you want to read the setup tutorial before proceeding? (y/n)",
    tutorialOpening: "Opening tutorial in your browser...",
    tutorialContinue: "Press Enter to continue after reading the tutorial...",
    clientIDPrompt: "Enter your Twitch Application Client ID:",
    clientIDPlaceholder: "Client ID",
    clientSecretPrompt: "Enter your Twitch Application Client Secret:",
    clientSecretPlaceholder: "Client Secret",
    runningSetup: "Running setup, please wait...",
    setupFailed: "❌ Setup failed:",
    setupSuccess: "✅ Configuration complete! .env file created.",
    pressYorN: "(Press 'y' or 'n')",
    pressCtrlCExit: "Press Ctrl+C to exit and try again.",
  },
  th: {
    titleLine1: "╔════════════════════════════════╗",
    titleLine2Left: "║        ",
    titleLine2Right: "        ║",
    titleLine3: "╚════════════════════════════════╝",
    selectLanguage: "เลือกภาษาในการติดตั้ง:",
    tutorialPrompt:
      "คุณต้องการอ่านคู่มือการติดตั้งก่อนดำเนินการต่อหรือไม่? (y/n)",
    tutorialOpening: "กำลังเปิดคู่มือในเบราว์เซอร์ของคุณ...",
    tutorialContinue: "กด Enter เพื่อดำเนินการต่อหลังจากอ่านคู่มือแล้ว...",
    clientIDPrompt: "กรุณาใส่ Client ID ของ Twitch Application ของคุณ:",
    clientIDPlaceholder: "Client ID",
    clientSecretPrompt: "กรุณาใส่ Client Secret ของ Twitch Application ของคุณ:",
    clientSecretPlaceholder: "Client Secret",
    runningSetup: "กำลังตั้งค่าโปรดรอสักครู่...",
    setupFailed: "❌ การตั้งค่าล้มเหลว:",
    setupSuccess: "✅ การกำหนดค่าครบถ้วน! สร้างไฟล์ .env เรียบร้อยแล้ว",
    pressYorN: "(กด 'y' หรือ 'n')",
    pressCtrlCExit: "กด Ctrl+C เพื่อออกและลองใหม่อีกครั้ง",
  },
} as const;

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  redBright: "\x1b[91m",
  greenBright: "\x1b[92m",
  yellowBright: "\x1b[93m",
};

// Utility functions for colored output
const colorize = (text: string, color: string, bold = false) => {
  const style = bold ? colors.bright : "";
  return `${style}${color}${text}${colors.reset}`;
};

const log = {
  info: (text: string) => console.log(text),
  success: (text: string) => console.log(colorize(text, colors.green, true)),
  error: (text: string) => console.log(colorize(text, colors.red, true)),
  warning: (text: string) => console.log(colorize(text, colors.yellow, true)),
  highlight: (text: string) => console.log(colorize(text, colors.cyan, true)),
  title: (text: string) => console.log(colorize(text, colors.magenta, true)),
  dim: (text: string) => console.log(colorize(text, colors.white + colors.dim)),
};

const openTutorial = async (lang: Lang): Promise<void> => {
  try {
    const url = TUTORIALS[lang];
    let command: string;
    let args: string[];

    if (process.platform === "win32") {
      command = "cmd";
      args = ["/c", "start", "", url];
    } else if (process.platform === "darwin") {
      command = "open";
      args = [url];
    } else {
      command = "xdg-open";
      args = [url];
    }

    Bun.spawn([command, ...args]);
  } catch (error) {
    log.error("Failed to open tutorial: " + error);
  }
};

const showTitle = (lang: Lang) => {
  const messages = MESSAGES[lang];
  console.clear();

  log.title(messages.titleLine1);
  log.title(
    `${messages.titleLine2Left}${colorize(`ManaoBot v${version}`, colors.cyan, true)}${messages.titleLine2Right}`,
  );
  log.title(messages.titleLine3);
  console.log();
};

const askQuestion = (question: string, hidden = false): Promise<string> => {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (hidden) {
      // Hide input for passwords
      const stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding("utf8");

      let input = "";
      console.log(question);

      const onData = (char: string) => {
        if (char === "\r" || char === "\n") {
          stdin.setRawMode(false);
          stdin.removeListener("data", onData);
          console.log();
          rl.close();
          resolve(input);
        } else if (char === "\u0003") {
          // Ctrl+C
          process.exit(0);
        } else if (char === "\u007f" || char === "\b") {
          // Backspace
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else if (char >= " " && char <= "~") {
          input += char;
          process.stdout.write("*");
        }
      };

      stdin.on("data", onData);
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
};

const selectLanguage = async (): Promise<Lang> => {
  console.log(
    colorize(
      "🔺 If you have set up ManaoBot before, feel free to close this window.",
      colors.redBright,
      true,
    ),
  );
  console.log(
    colorize(
      "🔺 หากคุณเคยตั้งค่า ManaoBot มาก่อนแล้ว สามารถปิดหน้าต่างนี้ได้เลย",
      colors.redBright,
      true,
    ),
  );
  console.log();

  while (true) {
    console.log(
      colorize(
        "Select setup language / เลือกภาษาในการติดตั้ง:",
        colors.yellow,
        true,
      ),
    );
    console.log("  1. English");
    console.log("  2. ภาษาไทย");
    console.log();

    const choice = await askQuestion(
      "Enter your choice / พิมพ์ตัวเลือกที่ต้องการ (1-2): ",
    );

    if (choice === "1") return "en";
    if (choice === "2") return "th";

    log.error("Invalid choice. Please enter 1 or 2.");
    console.log();
  }
};

const askTutorial = async (lang: Lang): Promise<boolean> => {
  const messages = MESSAGES[lang];

  while (true) {
    log.highlight(messages.tutorialPrompt);
    log.dim(messages.pressYorN);

    const answer = await askQuestion("");
    const normalized = answer.toLowerCase().trim();

    if (normalized === "y" || normalized === "yes") return true;
    if (normalized === "n" || normalized === "no") return false;

    log.error("Please enter 'y' or 'n'");
    console.log();
  }
};

const waitForEnter = async (message: string): Promise<void> => {
  await askQuestion(colorize(message, colors.yellow));
};

const main = async () => {
  try {
    // Step 1: Select language
    const lang = await selectLanguage();
    const messages = MESSAGES[lang];

    // Show title with selected language
    showTitle(lang);

    // Step 2: Ask about tutorial
    const wantsTutorial = await askTutorial(lang);

    if (wantsTutorial) {
      log.success(messages.tutorialOpening);
      await openTutorial(lang);
      await waitForEnter(messages.tutorialContinue);
    }

    // Step 3: Get Client ID
    showTitle(lang);
    log.title(messages.clientIDPrompt);
    const clientID = await askQuestion(`${messages.clientIDPlaceholder}: `);

    if (!clientID.trim()) {
      log.error("Client ID is required!");
      process.exit(1);
    }

    // Step 4: Get Client Secret
    console.log();
    log.title(messages.clientSecretPrompt);
    const clientSecret = await askQuestion(
      `${messages.clientSecretPlaceholder}: `,
      true,
    );

    if (!clientSecret.trim()) {
      log.error("Client Secret is required!");
      process.exit(1);
    }

    // Step 5: Run setup
    console.log();
    log.warning(messages.runningSetup);

    try {
      await startConfigWithParams(lang, clientID.trim(), clientSecret.trim());
      console.log();
      log.success(messages.setupSuccess);
    } catch (error) {
      console.log();
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      log.error(`${messages.setupFailed} ${errorMessage}`);
      log.warning(messages.pressCtrlCExit);
      process.exit(1);
    }
  } catch (error) {
    console.log();
    log.error("An unexpected error occurred: " + error);
    process.exit(1);
  }
};

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log("\n\nSetup cancelled by user.");
  process.exit(0);
});

// Start the application
main();
