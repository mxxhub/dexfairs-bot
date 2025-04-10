import { Pair } from "../model/model";

interface PairData {
  chainId: string | number;
  pairAddress: string;
  marketCap: number;
}

export const saveData = async (pairData: PairData) => {
  try {
    if (!pairData) return;
    const pair = new Pair({
      chainId: pairData.chainId,
      pairAddress: pairData.pairAddress,
      marketCap: pairData.marketCap,
    });

    const savedPair = await pair.save();
    if (!savedPair) {
      console.log("Error saving pair data");
      return;
    }
    console.log("Pair data saved successfully:");

    return savedPair;
  } catch (error) {
    console.log("Error saving pair data:", error);
  }
};
