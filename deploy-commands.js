import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";
import { capitalize } from "./utils.js";

function createCommandChoices() {
  return getRPSChoices().map((choice) => ({
    name: capitalize(choice),
    value: choice.toLowerCase(),
  }));
}

const REMIND_COMMAND = {
  name: "remind",
  description:
    "Send a reminder message to reply to someone else's message later",
  type: 1,
  options: [
    {
      name: "hours",
      description: "How many hours to wait before reminding",
      type: 10,
      required: true,
    },
    {
      name: "user",
      description: "User to remind",
      type: 6,
      required: true,
    },
    {
      name: "message",
      description: "Custom reminder message",
      type: 3,
      required: false,
    },
  ],
};

const DELAY_COMMAND = {
  name: "delay",
  description: "Send a message after a delay (in hours)",
  type: 1,
  options: [
    {
      type: 10,
      name: "hours",
      description: "Number of hours to wait",
      required: true,
    },
    {
      type: 3,
      name: "message",
      description: "Message to send after the delay",
      required: true,
    },
  ],
};

const ALL_COMMANDS = [REMIND_COMMAND, DELAY_COMMAND];

await InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);

console.log("✅ Commands deployed");
