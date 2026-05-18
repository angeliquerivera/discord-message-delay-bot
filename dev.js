// Full automation of all scripts needed for bot to run

import { spawn } from "child_process";
import ngrok from "ngrok";
import "dotenv/config";
import { execSync } from "child_process";

const APP_ID = process.env.APP_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

async function updateEndpoint(url) {
  const endpoint = `${url}/interactions`;

  const res = await fetch(
    `https://discord.com/api/v10/applications/${APP_ID}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bot ${DISCORD_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        interactions_endpoint_url: endpoint,
      }),
    },
  );

  if (!res.ok) {
    console.error("❌ Failed to update endpoint");
  } else {
    console.log("✅ Endpoint updated:", endpoint);
  }
}

async function start() {
  // 1. deploy commands FIRST
  console.log("🚀 Deploying commands...");
  execSync("node deploy-commands.js", { stdio: "inherit" });

  // 2. start bot
  spawn("node", ["app.js"], { stdio: "inherit" });

  // 3. start ngrok
  const url = await ngrok.connect(3000);

  console.log("\n🌍 Public URL:", url);

  // 4. update Discord endpoint
  await updateEndpoint(url);

  console.log("\n🎉 Dev environment ready");
}

start();
