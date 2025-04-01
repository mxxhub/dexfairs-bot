import { Pair } from "../model/model";

interface PairData {
  chainId: string;
  pairAddress: string;
  marketCap: number;
}

export const saveData = async (pairData: PairData) => {
  try {
    console.log(pairData);
    const pair = new Pair({
      chainId: pairData.chainId,
      pairAddress: pairData.pairAddress,
      marketCap: pairData.marketCap,
    });
    const savePair = await pair.save();
    console.log("Pair data saved successfully", savePair);
    return savePair;
  } catch (err) {
    console.log("Error saving pair data:", err);
    throw err;
  }
};
