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
