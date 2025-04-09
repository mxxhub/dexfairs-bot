import mongoose from "mongoose";
import { Pair } from "../model/model";

export const getPairDataFromDB = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("Waiting for MongoDB connection ...");
    }
    const data = await Pair.find({});
    if (!data || data.length === 0) {
      console.log("No data found");
      return;
    }
    return data;
  } catch (err) {
    console.log("Error in getPairDataFromDB", err);
  }
};
