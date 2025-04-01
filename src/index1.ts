import { connectDataBase } from "./db";
import { initBot } from "./bot";

async function start() {
  try {
    await connectDataBase();
    await initBot();
  } catch (err) {
    console.log(`Bot Start Error: ${err}`);
  }
}

start();
