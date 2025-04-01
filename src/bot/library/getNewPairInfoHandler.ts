import { eventEmitter } from "../../utils/getNewPair";
import { getPairInfo } from "../../utils/getPairInfo";
import { sendToChannels } from "../../utils/sendMsgChannel";
import { saveData } from "../../db/contoller/saveData";

export const getNewPairInfoHandler = async () => {
  console.log("New pairs is been detecting.");
  eventEmitter.on("newPair", async ({ token0, token1, pair }) => {
    try {
      const pairAdd = pair.toString();
      console.log("Received new pair:");
      console.log("token0:", token0);
      console.log("token1:", token1);
      console.log("pair:", pair);

      setTimeout(async () => {
        const pairInfo = await getPairInfo("ethereum", pairAdd);

        if (pairInfo.success) {
          await saveData(pairInfo.data);
          await sendToChannels(pairInfo.data);
        } else {
          console.log("Error fetching pair info:", pairInfo.message);
        }
      }, 2 * 60 * 1000); // 2 mins delay
    } catch (err) {
      console.error("Error fetching pair info:", err);
    }
  });
};
