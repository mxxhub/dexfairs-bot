import { Pair } from "../model/model";

export const getPairDataFromDB = async () => {
  const data = await Pair.find();
  if (!data) {
    console.log("No data found");
    return;
  }
  return data;
};
