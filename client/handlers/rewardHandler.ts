import { ChatClient } from "@twurple/chat";
import { db, initAccount } from "../../helpers/database";
import { logger } from "../../helpers/logger";
import { io } from "../../server";
import { FeedEvent } from "../types";
import { getCurrency } from "../../helpers/preferences";

/**
 * Handles channel point rewards and other currency rewards
 */
export function handleReward(
  amount: number,
  data: any,
  chatClient: ChatClient,
  icon: string = "🔁",
  type: string = "Redeem",
) {
  try {
    // Initialize user account if not exists
    initAccount(data.userId);
    // Get current currency
    const currency = getCurrency();

    // Update user's currency in database
    db.prepare("UPDATE users SET money = money + ? WHERE user = ?").run(
      amount,
      data.userId,
    );

    // Log the transaction
    logger.info(`[Reward] ${type} ${amount} ${currency} for ${data.userName}`);

    // Create feed event data
    const feedData: FeedEvent = {
      type: "normal",
      icon: icon,
      message: `System ➡ ${data.userDisplayName}`,
      action: `+ ${amount} ${currency}`,
    };

    // Emit the event to websocket clients
    io.emit("feed", feedData);

    // Send confirmation message in chat
    chatClient.say(
      process.env.TW_CHANNEL!,
      `@${data.userName} 💵 ${type === "Redeem" ? "แลกรับ" : "ได้รับ"} ${amount} ${currency} สำเร็จแล้ว!${
        type !== "Redeem" ? " ขอบคุณที่สนับสนุนช่องนี้ด้วยนะ!" : ""
      }`,
    );
  } catch (error) {
    // Get current currency
    const currency = getCurrency();

    logger.error(
      `[Reward] Error processing ${amount} ${currency} for ${data.userName}:`,
      error,
    );

    // Notify in chat if there was an error
    chatClient.say(
      process.env.TW_CHANNEL!,
      `@${data.userName} เกิดข้อผิดพลาดในการประมวลผลรางวัล กรุณาแจ้งผู้ดูแล`,
    );
  }
}
