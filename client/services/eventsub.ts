import { EventSubWsListener } from "@twurple/eventsub-ws";
import { ChatClient } from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import { logger } from "../helpers/logger";
import { REWARDS, REWARD_AMOUNTS, SUB_REWARD_AMOUNT } from "../config/constants";
import { handleReward } from "../handlers/rewardHandler";

/**
 * Initializes the EventSub WebSocket listener for Twitch events
 */
export async function initializeEventSub(chatClient: ChatClient, apiClient: ApiClient) {
  try {
    const listener = new EventSubWsListener({ apiClient });

    // Channel point redemptions
    setupRewardListeners(listener, chatClient);

    // Follow events
    setupFollowListener(listener, chatClient);

    // Subscription events
    setupSubscriptionListeners(listener, chatClient);

    // Start the listener
    await listener.start();
    logger.info("[EventSub] Listener started successfully");

    return listener;
  } catch (error) {
    logger.error("[EventSub] Failed to initialize:", error);
    throw error;
  }
}

/**
 * Sets up channel point reward listeners
 */
function setupRewardListeners(listener: EventSubWsListener, chatClient: ChatClient) {
  // Set up listeners for each reward
  Object.entries(REWARDS).forEach(([key, rewardId]) => {
    listener.onChannelRedemptionAddForReward(
      process.env.BROADCASTER_ID!,
      rewardId,
      (data) => {
        const rewardAmount = REWARD_AMOUNTS[rewardId];
        handleReward(rewardAmount, data, chatClient);
      }
    );
    logger.info(`[EventSub] Registered listener for reward: ${key}`);
  });
}

/**
 * Sets up follow event listener
 */
function setupFollowListener(listener: EventSubWsListener, chatClient: ChatClient) {
  listener.onChannelFollow(
    process.env.BROADCASTER_ID!,
    process.env.TW_ID!,
    (data) => {
      chatClient.say(
        process.env.TW_CHANNEL!,
        `🎉 ${data.userName} Selamat Pagi! ยินดีต้อนรับสู่ช่องของคนรั่ว ๆ เน้ออ`
      );
      logger.info(`[EventSub] New follower: ${data.userName}`);
    }
  );
  logger.info("[EventSub] Registered follower listener");
}

/**
 * Sets up subscription event listeners
 */
function setupSubscriptionListeners(listener: EventSubWsListener, chatClient: ChatClient) {
  // Regular subscription
  listener.onChannelSubscription(
    process.env.BROADCASTER_ID!,
    (data) => {
      handleReward(SUB_REWARD_AMOUNT, {
        userId: data.userId,
        userName: data.userName,
        userDisplayName: data.userDisplayName
      }, chatClient, "❤️", "Subscribe");
    }
  );

  // Gift subscription
  listener.onChannelSubscriptionGift(
    process.env.BROADCASTER_ID!,
    (data) => {
      const giftAmount = SUB_REWARD_AMOUNT * data.amount;
      handleReward(giftAmount, {
        userId: data.gifterId,
        userName: data.gifterName,
        userDisplayName: data.gifterDisplayName
      }, chatClient, "❤️", "Gift Subscribe");
    }
  );

  // Placeholder for cheer events
  listener.onChannelCheer(process.env.BROADCASTER_ID!, () => {
    // Future implementation
  });

  logger.info("[EventSub] Registered subscription listeners");
}