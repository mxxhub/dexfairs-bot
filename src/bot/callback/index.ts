import { getNewPairInfoHandler } from "../library/getNewPairInfoHandler";

export const callBackHandler = async (msg: any, action: string | any) => {
  try {
    switch (action) {
      case "getNewPair":
        getNewPairInfoHandler(msg);
        break;
    }
  } catch (error) {
    console.error("Error in callBackHandler:", error);
  }
};
