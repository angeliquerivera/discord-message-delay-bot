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
import { getShuffledOptions, getResult, getRPSChoices } from "./game.js";

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
    console.log("INTERACTION RECEIVED:");
    console.log(JSON.stringify(req.body, null, 2));
    const { type, data } = req.body;

    // PING (Discord handshake)
    if (type === 1) {
      return res.json({ type: 1 });
    }

    // Slash commands
    if (type === 2) {
      const { name } = data;

      if (name === "test") {
        return res.json({
          type: 4,
          data: {
            content: `hello world ${getRandomEmoji()}`,
          },
        });
      }
      if (name === "challenge") {
        try {
          const choice = data?.options?.[0]?.value;

          const botChoice =
            getRPSChoices()[Math.floor(Math.random() * getRPSChoices().length)];

          const result = getResult(
            { id: "user", objectName: choice },
            { id: "bot", objectName: botChoice },
          );

          return res.json({
            type: 4,
            data: {
              content: `You chose **${choice}**\nBot chose **${botChoice}**\n\n${result}`,
            },
          });
        } catch (err) {
          console.error("Challenge command error FULL:", err);

          return res.json({
            type: 4,
            data: {
              content: `⚠️ Error: ${err.message}`,
            },
          });
        }
        console.log("OPTIONS:", data?.options);
        console.log("DATA:", data);
      }
    }

    return res.sendStatus(200);
  },
);

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
