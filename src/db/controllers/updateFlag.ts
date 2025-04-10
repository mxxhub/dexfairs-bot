import { Pair } from "../model/model";

export const updateFlag = async (pairAdd: string, flag: boolean) => {
  try {
    const res = await Pair.updateOne(
      { pairAddress: pairAdd },
      { $set: { flag } }
    );

    if (res.matchedCount === 0) {
      console.log("No document matched the given pairAddress.");
    } else if (res.modifiedCount === 0) {
      console.log("Flag was already set to the given value.");
    } else {
      console.log("Flag updated successfully.");
    }
  } catch (err) {
    console.log("Error updating flag:", err);
  }
};
