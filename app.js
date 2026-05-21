import "dotenv/config";
import express from "express";
import fetch from "node-fetch";
import { verifyKeyMiddleware } from "discord-interactions";

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
    body: JSON.stringify({ content: message }),
  });
}

async function sendDM(userId, message) {
  const dmChannel = await fetch(
    `https://discord.com/api/v10/users/@me/channels`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient_id: userId }),
    },
  ).then((res) => res.json());
  await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
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

      if (type === 1) return res.json({ type: 1 });
      if (type !== 2) return res.sendStatus(200);

      const commandName = data?.name;

      if (commandName === "remind") {
        const hours = parseFloat(
          data.options.find((o) => o.name === "hours")?.value,
        );
        const customMessage =
          data.options.find((o) => o.name === "message")?.value ||
          "Hey! Reply to this message!";
        const userId = data.options.find((o) => o.name === "user")?.value;

        if (!userId || isNaN(hours) || hours <= 0) {
          return reply(res, "❌ Invalid input for remind command");
        }

        reply(res, `Okay! I'll remind <@${userId}> in ${hours} hour(s).`);

        setTimeout(
          async () => {
            try {
              await sendDM(userId, customMessage);
              console.log(`✅ Remind sent to ${userId}: ${customMessage}`);
            } catch (err) {
              console.error("❌ Failed to send DM:", err);
            }
          },
          hours * 60 * 60 * 1000,
        );

        return;
      }

      if (commandName === "delay") {
        const hours = parseFloat(
          data.options.find((o) => o.name === "hours")?.value,
        );
        const message = data.options.find((o) => o.name === "message")?.value;

        if (isNaN(hours) || hours <= 0) {
          return reply(res, "❌ Invalid number of hours");
        }

        reply(res, `⏳ Your message will be sent in ${hours} hour(s)`);

        setTimeout(
          async () => {
            try {
              await sendDelayedMessage(channel_id, message);
              console.log(`✅ Delayed message sent: ${message}`);
            } catch (err) {
              console.error("❌ Failed to send delayed message:", err);
            }
          },
          hours * 60 * 60 * 1000,
        );

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
