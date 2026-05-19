import "dotenv/config";
import express from "express";
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from "discord-interactions";
import { getRandomEmoji, DiscordRequest } from "./utils.js";

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// To keep track of our active games
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  (req, res) => {
    try {
      const { type, data } = req.body;

      if (type === 1) {
        return res.json({ type: 1 });
      }

      if (type === 2) {
        const name = data?.name;

        if (name === "test") {
          return res.json({
            type: 4,
            data: {
              content: `hello world ${getRandomEmoji()}`,
            },
          });
        }

        if (name === "delay") {
          const hoursOption = data?.options?.find(
            (o) => o.name === "hours",
          )?.value;
          const messageOption = data?.options?.find(
            (o) => o.name === "message",
          )?.value;

          const hours = parseFloat(hoursOption);
          const message = messageOption;

          if (isNaN(hours) || hours <= 0) {
            return res.json({
              type: 4,
              data: { content: "❌ Invalid number of hours. Must be > 0." },
            });
          }

          res.json({
            type: 4,
            data: {
              content: `⏳ Will send your message in ${hours} hour(s)...`,
            },
          });

          const delayMs = hours * 60 * 60 * 1000;

          setTimeout(async () => {
            try {
              await DiscordRequest({
                method: "POST",
                endpoint: `webhooks/${process.env.APP_ID}/${data?.token}`,
                body: { content: message },
              });
            } catch (err) {
              console.error("Error sending delayed message:", err);
            }
          }, delayMs);
        }

        return res.json({
          type: 4,
          data: { content: "unknown command" },
        });
      }

      return res.sendStatus(200);
    } catch (err) {
      console.error("GLOBAL INTERACTION ERROR:", err);

      return res.json({
        type: 4,
        data: {
          content: "⚠️ Internal error",
        },
      });
    }
  },
);

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
