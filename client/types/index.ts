import { ChatClient } from "@twurple/chat";
import { ApiClient } from "@twurple/api";

export interface Command {
  name: string;
  description: string;
  alias?: string[];
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

export interface CommandArg {
  name: string;
  description: string;
  required: boolean;
}

export interface ClientServices {
  chat: ChatClient;
  io: any; // Socket.io server
  api: ApiClient;
}

export interface CommandMeta {
  channel: string;
  user: string;
  userID: string;
  channelID: string;
  commands: CommandList;
}

export interface CommandList extends Map<string, Command> {}

export interface SongInfo {
  user: string;
  song: {
    title: string;
    author: string;
    thumbnail: string;
    id: string;
  };
}

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
