// Full automation of all scripts needed for bot to run

import { spawn, execSync } from "child_process";
import "dotenv/config";
import fetch from "node-fetch";

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
      body: JSON.stringify({ interactions_endpoint_url: endpoint }),
    },
  );

  if (!res.ok) {
    console.error("❌ Failed to update endpoint");
    console.log(await res.text());
  } else {
    console.log("✅ Endpoint updated:", endpoint);
  }
}

function killNgrok() {
  try {
    if (process.platform === "win32") {
      execSync("taskkill /F /IM ngrok.exe 2>nul");
    } else {
      execSync("pkill ngrok");
    }
    console.log("🛑 Old ngrok processes killed");
  } catch {
    // no processes to kill, ignore
  }
}

async function start() {
  killNgrok();

  console.log("🚀 Deploying commands...");
  execSync("node deploy-commands.js", { stdio: "inherit" });

  spawn("node", ["app.js"], { stdio: "inherit" });

  const ngrokProcess = spawn("ngrok", ["http", "3000"]);

  ngrokProcess.stdout.on("data", (data) => console.log(data.toString()));
  ngrokProcess.stderr.on("data", (data) => console.error(data.toString()));

  setTimeout(async () => {
    try {
      const res = await fetch("http://127.0.0.1:4040/api/tunnels");
      const json = await res.json();

      if (!json.tunnels || !json.tunnels.length) {
        throw new Error("No ngrok tunnel found!");
      }

      const url = json.tunnels[0].public_url;
      console.log("🌍 Public URL:", url);

      await updateEndpoint(url);
      console.log("🎉 Dev environment ready");
    } catch (err) {
      console.error("❌ Failed to get ngrok URL:", err);
    }
  }, 3000);
}

start();
