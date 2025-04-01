import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { callBackHandler } from "./callback";
import fs from "fs";
import path from "path";
import { removeAnswerCallback } from "./library";

dotenv.config();

const BOT_TOKEN = process.env.TOKEN || "";

export const bot = new TelegramBot(BOT_TOKEN, {
  polling: true,
});

export let answerCallbacks = {} as any;

bot.on("message", (message) => {
  var callback = answerCallbacks[message.chat.id];
  const msgstr = message.text;
  if (msgstr == "/cancel" && callback) {
    delete answerCallbacks[message.chat.id];
    return;
  }
  if (callback) {
    delete answerCallbacks[message.chat.id];
    return callback(message);
  }
});

bot.on("polling_error", console.log);

export class Commands {
  constructor(
    reg: RegExp,
    descript: string,
    cmd: string,
    isCommands: boolean,
    fn: Function,
    cb: Function
  ) {
    this.reg = reg;
    this.descript = descript;
    this.cmd = cmd;
    this.isCommands = isCommands;
    this.fn = fn;
    this.cb = cb;
  }
  reg: any;
  descript: string;
  cmd: string;
  isCommands: boolean;
  fn: Function;
  cb: Function;
}

async function loadCommands() {
  let commands = [] as any;
  for (const vo of fs.readdirSync(__dirname + "/command")) {
    if (path.extname(vo) === ".ts") {
      if (!fs.lstatSync(__dirname + "/command/" + vo).isDirectory()) {
        await import("./command/" + vo).then((module) => {
          const command = module.default;
          bot.onText(command.reg, (msg) => {
            command.fn(msg);
            removeAnswerCallback(msg.chat);
          });
          if (command.isCommands) {
            commands.push({
              command: command.cmd,
              description: command.descript,
            });
          }
          if (command.cb) {
            bot.on("callback_query", command.cb);
          }
        });
      }
    }
  }
  bot
    .setMyCommands(commands)
    .then((res) => {
      console.log(
        `Register bot menu commands${res ? "success" : "fail"} ${
          commands.length
        }个`
      );
    })
    .catch((err) => {
      console.log("The menu command for registering bot is wrong", err.message);
    });
}

async function loadEvents() {
  bot.on("callback_query", async function onCallbackQuery(callbackQuery: any) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    callBackHandler(msg, action);
  });
}

export const initBot = async () => {
  await loadCommands();
  await loadEvents();
};
