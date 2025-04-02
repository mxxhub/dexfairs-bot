import { Pair } from "../model/model";

export const deletePairData = async (pairAddress: string) => {
  try {
    const result = await Pair.deleteOne({ pairAddress });
    if (result.deletedCount === 0) {
      console.log("No pair found with address:", pairAddress);
      return false;
    }
    console.log("Pair deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting pair data:", error);
    return false;
  }
};
