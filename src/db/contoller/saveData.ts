import { Pair } from "../model/model";
// Interface for pair data
interface PairData {
  chainId: string | number;
  pairAddress: string;
  marketCap: number;
}

export const saveData = async (pairData: PairData) => {
  try {
    // Validate required fields
    if (!pairData) return;

    // Create new pair instance
    const pair = new Pair({
      chainId: pairData.chainId,
      pairAddress: pairData.pairAddress,
      marketCap: pairData.marketCap, // Default to 0 if not provided
    });

    // Save and return the result
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
