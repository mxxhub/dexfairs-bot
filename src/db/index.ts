import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDataBase = async () => {
  const mongoUrl = process.env.DATABASE || "";

  if (mongoose.connection.readyState === 1) {
    console.log("Already connected to MongoDB!");
    return;
  }

  try {
    const options = {
      autoCreate: true,
      retryReads: true,
    } as mongoose.ConnectOptions;
    mongoose.set("strictQuery", true);

    const result = await mongoose.connect(mongoUrl, options);

    if (result) {
      console.log("MongoDB connected successfully!");
    }
  } catch (err) {
    console.error(`MongoDB connect failed: ${err}`);
  }
};
