import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";
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

const ALL_COMMANDS = [TEST_COMMAND];

await InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);

console.log("✅ Commands deployed");
