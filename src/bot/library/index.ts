import { answerCallbacks } from "../../bot/index";

export const removeAnswerCallback = (chat: any) => {
  try {
    answerCallbacks[chat.id] = null;
    delete answerCallbacks[chat.id];
  } catch (err) {
    console.log(err);
  }
};
