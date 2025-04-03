import { Pair } from "../model/model";
const sevenDayAgo = new Date();

sevenDayAgo.setDate(sevenDayAgo.getDate() - 7);

export const getDataSevenAgo = async () => {
  try {
    const result = await Pair.find({ createdAt: { $lt: sevenDayAgo } });
    if (!result || result.length === 0) {
      console.log("No data found");
      return;
    }
    return result;
  } catch (err) {
    console.log("Error getting data from 7 days ago", err);
  }
};
