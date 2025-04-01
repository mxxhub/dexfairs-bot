import { Pair } from "../model/model";

export const getData = async () => {
  const data = await Pair.find();
  if (!data) {
    console.log("No data found");
    return;
  }
  return data;
};
