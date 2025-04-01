import { getNewPairInfoHandler } from "../library/getNewPairInfoHandler";
import { monitorMarketCapHandler } from "../library/monitorMarketCapHandler";

export const callBackHandler = async (msg: any, action: string | any) => {
  try {
    switch (action) {
      case "getNewPair":
        getNewPairInfoHandler(msg);
        break;
      case "monitorMarketCap":
        monitorMarketCapHandler(msg);
        break;
    }
  } catch (error) {
    console.error("Error in callBackHandler:", error);
  }
};
