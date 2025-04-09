import { connectDataBase } from "./db";
import { initBot } from "./bot";
import { initAll } from "./controllers/index";

async function start() {
  try {
    await connectDataBase();

    await initBot();

    await initAll();
  } catch (err) {
    console.log(`Bot Start Error: ${err}`);
  }
}

start();
