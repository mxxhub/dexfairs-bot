import { Pair } from "../model/model";

export const updatePair = async (pairAdd: string, updatedMarketCap: number) => {
  try {
    const result = await Pair.updateOne(
      { pairAddress: pairAdd },
      {
        $set: {
          marketCap: updatedMarketCap,
        },
      }
    );

    if (result.matchedCount === 0) {
      console.log(`No pair found with address: ${pairAdd}`);
      return null;
    }

    if (result.modifiedCount > 0) {
      return updatedMarketCap;
    } else {
      console.log("MarketCap was already up to date.");
      return updatedMarketCap;
    }
  } catch (err) {
    console.log("Error updating pair data: ", err);
    return null;
  }
};
