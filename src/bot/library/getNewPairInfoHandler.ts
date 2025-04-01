import { eventEmitter } from "../../utils/getNewPair";
import { getPairInfo } from "../../utils/getPairInfo";
import { sendToChannels } from "../../utils/sendMsgChannel";
import { sendMessage } from "../../utils/sendMsgChannel";
import { saveData } from "../../db/contoller/saveData";
import { bot } from "../../bot/index";
import { getPairDataFromDB } from "../../db/contoller/getData";
// import { getMarketCapCron } from "../../utils/getMarketCap";

let gPairData: Array<any> = [];

const test = async () => {
  const a = await getPairInfo(
    "ethereum",
    "0xc998c12aeeB7e88ede7b3f702501355385ED3538"
  );
  const b = a?.data;
  sendToChannels(b);
};

// test();

const getinfoInDB = async () => {
  const data = await getPairDataFromDB();
  if (!data) return;
  await data.map(async (each: any) => {
    // console.log(each.pairAddress);
    // console.log(each.marketCap);
    return {
      pairAddress: each.pairAddress,
      marketCap: each.marketCap,
    };
  });
};

export const getNewPairInfoHandler = async (msg: any) => {
  await bot.sendMessage(msg.chat.id, `New pairs is been detecting.`);
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
        if (pairInfo.data) {
          await saveData(pairInfo?.data);
        }

        if (pairInfo?.success) {
          const pairData = pairInfo?.data;
          console.log("pairData:", pairData);
          await sendMessage(msg.chat.id, pairData);
          await sendToChannels(pairData);
        } else {
          console.log("Error fetching pair info:", pairInfo?.message);
        }
      }, 2 * 60 * 1000); // 2 mins delay
    } catch (err) {
      console.error("Error fetching pair info:", err);
    }
  });
};
