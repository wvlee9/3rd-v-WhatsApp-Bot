import "dotenv/config";
export const config = {
  port: Number(process.env.PORT || 3000),
  verifyToken: process.env.VERIFY_TOKEN || "",
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
  phoneNumberId: process.env.PHONE_NUMBER_ID || "",
  graphApiVersion: process.env.GRAPH_API_VERSION || "v23.0",
  adminNumbers: new Set((process.env.ADMIN_NUMBERS || "").split(",").map(x=>x.trim()).filter(Boolean)),
  botName: process.env.BOT_NAME || "WVLEE9 WH BOT",
  welcomeMessage: process.env.WELCOME_MESSAGE || "مرحباً بك 👋🔥",
  autoReplyEnabled: process.env.AUTO_REPLY_ENABLED !== "false",
  antiSpamEnabled: process.env.ANTI_SPAM_ENABLED !== "false",
  spamLimit: Number(process.env.SPAM_LIMIT || 6),
  spamWindowSeconds: Number(process.env.SPAM_WINDOW_SECONDS || 20)
};
