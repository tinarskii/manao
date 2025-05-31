// @ts-nocheck
import React, { useState, useCallback } from "react";
import { render, Box, Text, Newline, useInput } from "ink";
import TextInput from "ink-text-input";
import SelectInput from "ink-select-input";
import { startConfigWithParams } from "./setup-core";
import { version } from "./package.json";

type Lang = "en" | "th";
type SetupStep =
  | "language"
  | "tutorialPrompt"
  | "tutorialAnswer"
  | "clientID"
  | "clientSecret"
  | "running"
  | "done"
  | "error";

interface LangOption {
  label: string;
  value: Lang;
}

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

const LANG_OPTIONS: readonly LangOption[] = [
  { label: "English", value: "en" },
  { label: "ภาษาไทย", value: "th" },
] as const;

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
    tutorialPrompt: "Do you want to read the setup tutorial before proceeding? (y/n)",
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
    tutorialPrompt: "คุณต้องการอ่านคู่มือการติดตั้งก่อนดำเนินการต่อหรือไม่? (y/n)",
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

interface TitleProps {
  lang: Lang;
}

const Title: React.FC<TitleProps> = ({ lang }) => {
  const messages = MESSAGES[lang];

  return (
    <Box justifyContent="center" marginBottom={1}>
      <Text color="magenta" bold>
        {messages.titleLine1}
        <Newline />
        {messages.titleLine2Left}
        <Text color="cyan" bold>
          ManaoBot v{version}
        </Text>
        {messages.titleLine2Right}
        <Newline />
        {messages.titleLine3}
      </Text>
    </Box>
  );
};

const openTutorial = async (lang: Lang): Promise<void> => {
  try {
    const url = TUTORIALS[lang];

    // Use Bun's spawn for cross-platform compatibility
    if (process.platform === "win32") {
      Bun.spawn(["cmd", "/c", "start", "", url]);
    } else if (process.platform === "darwin") {
      Bun.spawn(["open", url]);
    } else {
      Bun.spawn(["xdg-open", url]);
    }
  } catch (error) {
    console.error("Failed to open tutorial:", error);
  }
};

const SetupUI: React.FC = () => {
  const [step, setStep] = useState<SetupStep>("language");
  const [lang, setLang] = useState<Lang>("en");
  const [tutorialAnswer, setTutorialAnswer] = useState<string | null>(null);
  const [clientID, setClientID] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messages = MESSAGES[lang];

  const handleTutorialInput = useCallback((input: string) => {
    const normalizedInput = input.toLowerCase().trim();

    if (normalizedInput === "y") {
      setTutorialAnswer("y");
      setStep("tutorialAnswer");
      openTutorial(lang);
    } else if (normalizedInput === "n") {
      setTutorialAnswer("n");
      setStep("clientID");
    }
  }, [lang]);

  useInput((input, key) => {
    if (step === "tutorialPrompt") {
      handleTutorialInput(input);
    }
  });

  const handleLanguageSelect = useCallback((item: LangOption) => {
    setLang(item.value);
    setStep("tutorialPrompt");
  }, []);

  const handleTutorialContinue = useCallback(() => {
    setStep("clientID");
  }, []);

  const handleClientIDSubmit = useCallback(() => {
    if (clientID.trim()) {
      setStep("clientSecret");
    }
  }, [clientID]);

  const runSetup = useCallback(async () => {
    if (!clientID.trim() || !clientSecret.trim()) {
      setErrorMsg("Client ID and Client Secret are required");
      setStep("error");
      return;
    }

    setStep("running");

    try {
      await startConfigWithParams(lang, clientID.trim(), clientSecret.trim());
      setStep("done");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setErrorMsg(errorMessage);
      setStep("error");
    }
  }, [lang, clientID, clientSecret]);

  const handleClientSecretSubmit = useCallback(() => {
    if (clientSecret.trim()) {
      runSetup();
    }
  }, [clientSecret, runSetup]);

  return (
    <Box flexDirection="column" padding={1}>
      <Title lang={lang} />

      {step === "language" && (
        <>
          <Text bold color="redBright">
            🔺 If you have set up ManaoBot before, feel free to close this window.
          </Text>
          <Text bold color="redBright">
            🔺 หากคุณเคยตั้งค่า ManaoBot มาก่อนแล้ว สามารถปิดหน้าต่างนี้ได้เลย
          </Text>
          <Newline />
          <Text bold color="yellow">
            {messages.selectLanguage}
          </Text>
          <SelectInput items={LANG_OPTIONS} onSelect={handleLanguageSelect} />
        </>
      )}

      {step === "tutorialPrompt" && (
        <>
          <Text color="cyan" bold>
            {messages.tutorialPrompt}
          </Text>
          <Text dimColor>{messages.pressYorN}</Text>
        </>
      )}

      {step === "tutorialAnswer" && tutorialAnswer === "y" && (
        <>
          <Text color="greenBright" bold>
            {messages.tutorialOpening}
          </Text>
          <Text color="yellow">{messages.tutorialContinue}</Text>
          <TextInput
            value=""
            onChange={() => {}}
            onSubmit={handleTutorialContinue}
            placeholder=""
          />
        </>
      )}

      {step === "clientID" && (
        <>
          <Text color="magenta" bold>
            {messages.clientIDPrompt}
          </Text>
          <TextInput
            value={clientID}
            onChange={setClientID}
            onSubmit={handleClientIDSubmit}
            placeholder={messages.clientIDPlaceholder}
          />
        </>
      )}

      {step === "clientSecret" && (
        <>
          <Text color="magenta" bold>
            {messages.clientSecretPrompt}
          </Text>
          <TextInput
            value={clientSecret}
            onChange={setClientSecret}
            onSubmit={handleClientSecretSubmit}
            placeholder={messages.clientSecretPlaceholder}
            mask="*"
          />
        </>
      )}

      {step === "running" && (
        <Text color="yellowBright" bold>
          {messages.runningSetup}
        </Text>
      )}

      {step === "done" && (
        <Text color="green" bold>
          {messages.setupSuccess}
        </Text>
      )}

      {step === "error" && (
        <>
          <Text color="red" bold>
            {messages.setupFailed} {errorMsg}
          </Text>
          <Text color="yellow">{messages.pressCtrlCExit}</Text>
        </>
      )}
    </Box>
  );
};

// Start the application
render(<SetupUI />);