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
    if (result) return updatedMarketCap as number;
  } catch (err) {
    console.log("Error updating pair data: ", err);
  }
};
