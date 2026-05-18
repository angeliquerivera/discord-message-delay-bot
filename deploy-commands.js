import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";
import { getRPSChoices } from "./game.js";
import { capitalize } from "./utils.js";

function createCommandChoices() {
  return getRPSChoices().map((choice) => ({
    name: capitalize(choice),
    value: choice.toLowerCase(),
  }));
}

const TEST_COMMAND = {
  name: "test",
  description: "Basic command",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const CHALLENGE_COMMAND = {
  name: "challenge",
  description: "Play rock paper scissors",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
  options: [
    {
      type: 3,
      name: "object",
      description: "Pick rock, paper, or scissors",
      required: true,
      choices: getRPSChoices().map((c) => ({
        name: capitalize(c),
        value: c.toLowerCase(),
      })),
    },
  ],
};

const ALL_COMMANDS = [TEST_COMMAND, CHALLENGE_COMMAND];

await InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);

console.log("✅ Commands deployed");
