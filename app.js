import "dotenv/config";
import express from "express";
import { verifyKeyMiddleware } from "discord-interactions";
import { getRandomEmoji } from "./utils.js";

const app = express();
const PORT = process.env.PORT || 3000;

const reply = (res, content) =>
  res.json({
    type: 4,
    data: { content },
  });

async function sendDelayedMessage(channelId, message) {
  await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: message,
    }),
  });
}

app.get("/", (_, res) => {
  res.send("Bot is running");
});

app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  async (req, res) => {
    try {
      const { type, data, channel_id } = req.body;

      if (type === 1) {
        return res.json({ type: 1 });
      }

      if (type !== 2) {
        return res.sendStatus(200);
      }

      const name = data?.name;

      if (name === "test") {
        return reply(res, `hello world ${getRandomEmoji()}`);
      }

      if (name === "delay") {
        const hours = parseFloat(
          data.options.find((o) => o.name === "hours")?.value,
        );

        const message = data.options.find((o) => o.name === "message")?.value;

        if (isNaN(hours) || hours <= 0) {
          return reply(res, "❌ Invalid number of hours");
        }

        reply(res, `⏳ Your message will be sent in ${hours} hour(s)`);

        const delayMs = hours * 60 * 60 * 1000;

        setTimeout(async () => {
          try {
            await sendDelayedMessage(channel_id, message);

            console.log(`✅ Delayed message sent: ${message}`);
          } catch (err) {
            console.error("❌ Failed to send delayed message:", err);
          }
        }, delayMs);

        return;
      }

      return reply(res, "❓ Unknown command");
    } catch (err) {
      console.error("❌ GLOBAL INTERACTION ERROR:", err);

      return reply(res, "⚠️ Internal error");
    }
  },
);

app.listen(PORT, () => {
  console.log(`✅ Listening on port ${PORT}`);
});
