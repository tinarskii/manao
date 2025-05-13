import { ChatClient } from "@twurple/chat";
import { ApiClient } from "@twurple/api";

export interface LocalizedString {
  en: string;
  th: string;
}

export interface LocalizedStringArray {
  en: string[];
  th: string[];
}

export interface CommandArg {
  name: LocalizedString;
  description: LocalizedString;
  required?: boolean;
}

export interface Command {
  name: LocalizedString;
  description: LocalizedString;
  aliases?: LocalizedStringArray;
  args?: CommandArg[];
  modsOnly?: boolean;
  broadcasterOnly?: boolean;
  disabled?: boolean;
  originalExecute?: any;
  execute: (
    client: ClientServices,
    meta: CommandMeta,
    message: string,
    args: string[],
  ) => void;
}

export interface ClientServices {
  chat: ChatClient;
  io: any; // Socket.io server
  api: ApiClient;
}

export interface CommandMeta {
  user: string;
  channel: string;
  channelID: string;
  userID: string;
  commands: CommandList;
  lang: "en" | "th";
  currency: string;
}

export interface CommandList extends Map<string, Command> {}

export interface UserBadge {
  title?: string;
  link?: string;
}

export interface MessageData {
  from: string;
  message: string;
  user: any;
  id: string;
  role: string;
  color: string;
  badges: string[];
}

export interface FeedEvent {
  type: "normal" | "error" | "success" | "neutral";
  icon: string;
  message: string;
  action: string;
}
