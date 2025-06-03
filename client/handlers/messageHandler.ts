import {
  buildEmoteImageUrl,
  ChatClient,
  parseEmotePositions,
} from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import { PREFIX } from "../../config/constants";
import { handleCommand } from "./commandHandler";
import { io } from "../../server";
import { MessageData, UserBadge } from "../../types";
import { logger } from "../../helpers/logger";
import { getNickname } from "../../helpers/database";

/**
 * Processes an incoming chat message
 */
export async function handleMessage(
  channel: string,
  user: string,
  message: string,
  msgObj: any,
  userID: string,
  channelID: string,
  chatClient: ChatClient,
  apiClient: ApiClient,
) {
  try {
    // Check if message is a command
    if (message.startsWith(PREFIX)) {
      await handleCommand(
        channel,
        user,
        userID,
        channelID,
        message,
        chatClient,
        apiClient,
      );
    } else {
      await handleRegularMessage(
        channel,
        user,
        message,
        msgObj,
        userID,
        apiClient,
      );
    }
  } catch (error) {
    logger.error("[Message] Error processing message:", error);
  }
}

/**
 * Processes a regular chat message (non-command)
 */
async function handleRegularMessage(
  channel: string,
  user: string,
  message: string,
  msgObj: any,
  userID: string,
  apiClient: ApiClient,
) {
  try {
    // Get user nickname & determine role
    const nickname = getNickname(userID);
    const role = determineUserRole(msgObj.userInfo);

    // Process emotes in the message
    const processedMessage = await processEmotes(message, msgObj);

    // Get user badges
    const badgeList = await processUserBadges(
      msgObj.userInfo.badges,
      apiClient,
    );

    // Build message data object
    const messageData: MessageData = {
      from: nickname
        ? `${msgObj.userInfo.displayName} (${nickname})`
        : msgObj.userInfo.displayName,
      message: processedMessage,
      user: msgObj.userInfo,
      id: msgObj.id,
      role,
      color: msgObj.userInfo.color,
      badges: badgeList,
    };

    // Emit message to websocket clients
    io.emit("message", messageData);
  } catch (error) {
    logger.error("[Message] Error processing regular message:", error);
  }
}

/**
 * Determines user's role in chat
 */
function determineUserRole(userInfo: any): string {
  if (userInfo.isBroadcaster) return "broadcaster";
  if (userInfo.isMod) return "mod";
  if (userInfo.isVip) return "vip";
  if (userInfo.isSubscriber) return "sub";
  return "normal";
}

/**
 * Processes emotes in a message
 */
async function processEmotes(message: string, msgObj: any): Promise<string> {
  let processedMessage = message;
  const emoteList = parseEmotePositions(message, msgObj.emoteOffsets);

  for (const emote of emoteList) {
    const emoteUrl = buildEmoteImageUrl(emote.id, { size: "3.0" });
    processedMessage = processedMessage.replace(
      emote.name,
      `<img src="${emoteUrl}" alt="emote" /> `,
    );
  }

  return processedMessage;
}

/**
 * Processes user badges
 */
async function processUserBadges(
  badges: Map<string, string>,
  apiClient: ApiClient,
): Promise<string[]> {
  try {
    const badgeList: string[] = [];
    const globalBadges = await apiClient.chat.getGlobalBadges();

    const globalBadgeTitles: UserBadge[] = globalBadges.map((badge) => ({
      title: badge.getVersion("1")?.title,
      link: badge.getVersion("1")?.getImageUrl(4),
    }));

    [...badges.keys()].forEach((badge) => {
      const badgeTitle = globalBadgeTitles.find(
        (b) => b.title?.toLowerCase().split(" ").join("-") === badge,
      );

      if (badgeTitle && badgeTitle.link) {
        badgeList.push(badgeTitle.link);
      }
    });

    return badgeList;
  } catch (error) {
    logger.error("[Badges] Error processing badges:", error);
    return [];
  }
}
